import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  OnGatewayDisconnect,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ProjectMemberRole } from '../projects/entities/project-member.entity';
import { ProjectsService } from '../projects/projects.service';
import { CollaborationService } from './collaboration.service';

type AuthenticatedSocketUser = {
  email: string;
  id: string;
};

type CollaboratorPresence = {
  color: string;
  name: string;
  socketId: string;
  userId: string;
  cursor?: {
    column: number;
    lineNumber: number;
  };
};

const PRESENCE_COLORS = [
  '#ef4444',
  '#f97316',
  '#eab308',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
];

function getCookieValue(cookieHeader: string, name: string) {
  const cookiePair = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  return cookiePair ? decodeURIComponent(cookiePair.split('=').slice(1).join('=')) : null;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class CollaborationGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server!: Server;

  private readonly roomCollaborators = new Map<
    string,
    Map<string, CollaboratorPresence>
  >();
  private readonly saveTimers = new Map<
    string,
    ReturnType<typeof setTimeout>
  >();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly collaborationService: CollaborationService,
    private readonly projectsService: ProjectsService,
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const rawCookie = socket.handshake.headers.cookie ?? '';
      const token = getCookieValue(rawCookie, 'access_token');

      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      });

      socket.data.user = {
        id: payload.sub,
        email: payload.email,
      };
    } catch {
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    const projectId = socket.data.projectId as string | undefined;

    if (!projectId) {
      return;
    }

    const collaborators = this.roomCollaborators.get(projectId);

    if (!collaborators) {
      return;
    }

    for (const [key, collaborator] of collaborators) {
      if (collaborator.socketId === socket.id) {
        collaborators.delete(key);
      }
    }

    if (collaborators.size === 0) {
      this.flushProjectSave(projectId);
      this.roomCollaborators.delete(projectId);
      return;
    }

    this.broadcastPresence(projectId);
  }

  @SubscribeMessage('project:join')
  async handleJoin(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { projectId: string },
  ) {
    const userId = this.getSocketUserId(socket);
    const membership = await this.projectsService.getMembership(
      body.projectId,
      userId,
    );

    if (!membership) {
      socket.emit('project:error', { message: 'No access' });
      return;
    }

    const project = await this.projectsService.findAccessibleProject(
      body.projectId,
      userId,
    );

    if (!project) {
      socket.emit('project:error', { message: 'Project not found' });
      return;
    }

    const roomId = `project:${body.projectId}`;
    await socket.join(roomId);
    socket.data.projectId = body.projectId;

    const yText = this.collaborationService.getText(body.projectId);

    if (!yText.toString() && project.code) {
      yText.insert(0, project.code);
    }

    socket.emit('project:init', {
      role: membership.role,
      update: Array.from(this.collaborationService.getState(body.projectId)),
    });

    const collaborators = this.getProjectCollaborators(body.projectId);
    for (const [key, collaborator] of collaborators) {
      if (collaborator.userId === userId) {
        collaborators.delete(key);
      }
    }

    collaborators.set(userId, {
      color: this.getPresenceColor(userId),
      name: membership.user.name ?? membership.user.email,
      socketId: socket.id,
      userId,
    });

    this.broadcastPresence(body.projectId);
  }

  @SubscribeMessage('project:update')
  async handleUpdate(
    @ConnectedSocket() socket: Socket,
    @MessageBody() body: { projectId: string; update: number[] },
  ) {
    const userId = this.getSocketUserId(socket);
    const membership = await this.projectsService.getMembership(
      body.projectId,
      userId,
    );

    if (!membership || membership.role === ProjectMemberRole.VIEWER) {
      socket.emit('project:error', { message: 'No edit access' });
      return;
    }

    const update = Uint8Array.from(body.update);
    this.collaborationService.applyUpdate(body.projectId, update);

    this.scheduleProjectSave(body.projectId);
    this.broadcastPresence(body.projectId);

    socket.to(`project:${body.projectId}`).emit('project:update', body.update);
  }

  @SubscribeMessage('project:cursor')
  async handleCursor(
    @ConnectedSocket() socket: Socket,
    @MessageBody()
    body: {
      projectId: string;
      position: {
        column: number;
        lineNumber: number;
      } | null;
    },
  ) {
    const userId = this.getSocketUserId(socket);
    const membership = await this.projectsService.getMembership(
      body.projectId,
      userId,
    );

    if (!membership) {
      socket.emit('project:error', { message: 'No access' });
      return;
    }

    const collaborators = this.getProjectCollaborators(body.projectId);
    const collaborator = collaborators.get(userId);

    if (!collaborator) {
      return;
    }

    collaborator.cursor = body.position ?? undefined;
    this.broadcastPresence(body.projectId);
  }

  private getProjectCollaborators(projectId: string) {
    let collaborators = this.roomCollaborators.get(projectId);

    if (!collaborators) {
      collaborators = new Map<string, CollaboratorPresence>();
      this.roomCollaborators.set(projectId, collaborators);
    }

    return collaborators;
  }

  private broadcastPresence(projectId: string) {
    const collaborators = this.roomCollaborators.get(projectId);

    this.server.to(`project:${projectId}`).emit('project:presence', {
      collaborators: collaborators ? Array.from(collaborators.values()) : [],
    });
  }

  private getPresenceColor(userId: string) {
    let hash = 0;

    for (const char of userId) {
      hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }

    return PRESENCE_COLORS[hash % PRESENCE_COLORS.length];
  }

  private getSocketUser(socket: Socket): AuthenticatedSocketUser {
    return socket.data.user as AuthenticatedSocketUser;
  }

  private getSocketUserId(socket: Socket) {
    return this.getSocketUser(socket).id;
  }

  private scheduleProjectSave(projectId: string) {
    const currentTimer = this.saveTimers.get(projectId);

    if (currentTimer) {
      clearTimeout(currentTimer);
    }

    const timer = setTimeout(() => {
      this.persistProjectSaveInBackground(projectId);
      this.saveTimers.delete(projectId);
    }, 500);

    this.saveTimers.set(projectId, timer);
  }

  private flushProjectSave(projectId: string) {
    const currentTimer = this.saveTimers.get(projectId);

    if (currentTimer) {
      clearTimeout(currentTimer);
      this.saveTimers.delete(projectId);
    }

    this.persistProjectSaveInBackground(projectId);
  }

  private async persistProjectSave(projectId: string) {
    const code = this.collaborationService.getText(projectId).toString();
    await this.projectsService.updateProjectCode(projectId, code);
  }

  private persistProjectSaveInBackground(projectId: string) {
    void (async () => {
      try {
        await this.persistProjectSave(projectId);
      } catch {
        return;
      }
    })();
  }
}
