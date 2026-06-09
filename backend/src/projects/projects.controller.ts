import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { CreateProjectInviteDto } from './dto/create-project-invite.dto';

type RequestWithUser = Request & {
  user: {
    id: string;
    email: string;
  };
};

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  create(
    @Body() createProjectDto: CreateProjectDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.create(createProjectDto, req.user.id);
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  findAll(@Req() req: RequestWithUser) {
    return this.projectsService.findAll(req.user.id);
  }

  @Post(':id/invite-link')
  @UseGuards(AuthGuard('jwt'))
  createOrGetInvite(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() createProjectInviteDto: CreateProjectInviteDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.createOrGetInvite(
      id,
      req.user.id,
      createProjectInviteDto,
    );
  }

  @Get('invite-links/:token')
  @UseGuards(AuthGuard('jwt'))
  getInvite(@Param('token') token: string) {
    return this.projectsService.getInviteByToken(token);
  }

  @Post('invite-links/:token/accept')
  @UseGuards(AuthGuard('jwt'))
  acceptInvite(@Param('token') token: string, @Req() req: RequestWithUser) {
    return this.projectsService.acceptInvite(token, req.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard('jwt'))
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.findOne(req.user.id, id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard('jwt'))
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() updateProjectDto: UpdateProjectDto,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.update(id, updateProjectDto, req.user.id);
  }

  @Delete(':id')
  @UseGuards(AuthGuard('jwt'))
  remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.remove(id, req.user.id);
  }
}
