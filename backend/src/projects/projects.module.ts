import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsController } from './projects.controller';
import { ProjectInvite } from './entities/project-invite.entity';
import { ProjectMember } from './entities/project-member.entity';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';

@Module({
  imports: [TypeOrmModule.forFeature([Project, ProjectMember, ProjectInvite])],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [ProjectsService],
})
export class ProjectsModule {}
