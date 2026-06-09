import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomBytes } from 'crypto';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';
import { ProjectInvite } from './entities/project-invite.entity';
import { ProjectMember, ProjectMemberRole } from './entities/project-member.entity';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,
    @InjectRepository(ProjectInvite)
    private readonly projectInviteRepository: Repository<ProjectInvite>,
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: string) {
    const project = await this.projectRepository.save(
      this.projectRepository.create({
        ...createProjectDto,
        owner: {
          id: userId,
        },
      }),
    );

    await this.projectMemberRepository.save(
      this.projectMemberRepository.create({
        project: {
          id: project.id,
        },
        user: {
          id: userId,
        },
        role: ProjectMemberRole.OWNER,
      }),
    );

    const createdProject = await this.projectRepository.findOne({
      where: { id: project.id },
      relations: {
        owner: true,
      },
    });

    if (!createdProject) {
      throw new NotFoundException('Project not found after create');
    }

    return this.toProjectResponse(createdProject, ProjectMemberRole.OWNER);
  }

  async findAll(userId: string) {
    const projects = await this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.owner', 'owner')
      .innerJoinAndSelect(
        'project.members',
        'membership',
        'membership.user.id = :userId',
        { userId },
      )
      .getMany();

    return projects.map((project) => {
      const membership = project.members[0];
      const membershipRole = membership?.role ?? ProjectMemberRole.OWNER;

      return this.toProjectResponse(project, membershipRole);
    });
  }

  findAccessibleProject(projectId: string, userId: string) {
    return this.projectRepository
      .createQueryBuilder('project')
      .leftJoinAndSelect('project.members', 'member')
      .leftJoinAndSelect('member.user', 'user')
      .where('project.id = :projectId', { projectId })
      .andWhere('user.id = :userId', { userId })
      .getOne();
  }

  findOne(userId: string, id: string) {
    return this.findAccessibleProject(id, userId);
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const membership = await this.getMembership(id, userId);

    if (!membership || membership.role === ProjectMemberRole.VIEWER) {
      return null;
    }

    const project = await this.projectRepository.findOne({
      where: {
        id,
      },
    });

    if (!project) {
      return null;
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  updateProjectCode(projectId: string, code: string) {
    return this.projectRepository.update(projectId, { code });
  }

  getMembership(projectId: string, userId: string) {
    return this.projectMemberRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
      },
      relations: {
        project: true,
        user: true,
      },
    });
  }

  async isOwner(projectId: string, userId: string) {
    const membership = await this.projectMemberRepository.findOne({
      where: {
        project: { id: projectId },
        user: { id: userId },
        role: ProjectMemberRole.OWNER,
      },
    });

    return !!membership;
  }

  async createOrGetInvite(
    projectId: string,
    userId: string,
    _dto?: CreateProjectInviteDto,
  ) {
    const owner = await this.isOwner(projectId, userId);

    if (!owner) {
      throw new ForbiddenException('Only owner can manage invite link');
    }

    const existingInvite = await this.projectInviteRepository.findOne({
      where: {
        project: { id: projectId },
      },
      relations: {
        project: true,
      },
    });

    if (existingInvite) {
      return {
        token: existingInvite.token,
        role: existingInvite.role,
        projectId,
      };
    }

    const invite = this.projectInviteRepository.create({
      project: { id: projectId },
      createdBy: { id: userId },
      token: randomBytes(24).toString('hex'),
      role: ProjectMemberRole.EDITOR,
    });

    const savedInvite = await this.projectInviteRepository.save(invite);

    return {
      token: savedInvite.token,
      role: savedInvite.role,
      projectId,
    };
  }

  async getInviteByToken(token: string) {
    const invite = await this.projectInviteRepository.findOne({
      where: { token },
      relations: {
        project: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    return {
      token: invite.token,
      role: invite.role,
      project: {
        id: invite.project.id,
        name: invite.project.name,
      },
    };
  }

  async acceptInvite(token: string, userId: string) {
    const invite = await this.projectInviteRepository.findOne({
      where: { token },
      relations: {
        project: true,
      },
    });

    if (!invite) {
      throw new NotFoundException('Invite not found');
    }

    const existingMembership = await this.projectMemberRepository.findOne({
      where: {
        project: { id: invite.project.id },
        user: { id: userId },
      },
    });

    if (!existingMembership) {
      await this.projectMemberRepository.save(
        this.projectMemberRepository.create({
          project: { id: invite.project.id },
          user: { id: userId },
          role: invite.role,
        }),
      );
    }

    return {
      projectId: invite.project.id,
      role: existingMembership?.role ?? invite.role,
    };
  }

  async remove(id: string, userId: string) {
    const isOwner = await this.isOwner(id, userId);

    if (!isOwner) {
      throw new ForbiddenException('Only owner can delete project');
    }

    const project = await this.projectRepository.findOne({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    await this.projectRepository.remove(project);

    return {
      success: true,
    };
  }

  private toProjectResponse(
    project: Project,
    membershipRole: ProjectMemberRole,
  ) {
    return {
      code: project.code,
      createdAt: project.createdAt,
      id: project.id,
      isOwner: membershipRole === ProjectMemberRole.OWNER,
      language: project.language,
      membershipRole,
      name: project.name,
      owner: {
        email: project.owner.email,
        id: project.owner.id,
        name: project.owner.name ?? project.owner.email,
      },
      updatedAt: project.updatedAt,
    };
  }
}
