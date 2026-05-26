import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from './entities/project.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
  ) {}

  create(createProjectDto: CreateProjectDto, userId: string) {
    const project = this.projectRepository.create({
      ...createProjectDto,
      owner: {
        id: userId,
      },
    });
    return this.projectRepository.save(project);
  }

  findAll(userId: string) {
    return this.projectRepository.find({
      where: {
        owner: {
          id: userId,
        },
      },
    });
  }

  findOne(userId: string, id: string) {
    return this.projectRepository.findOne({
      where: {
        id: id,
        owner: {
          id: userId,
        },
      },
    });
  }

  async update(id: string, updateProjectDto: UpdateProjectDto, userId: string) {
    const project = await this.projectRepository.findOne({
      where: {
        id,
        owner: {
          id: userId,
        },
      },
    });
    if (!project) return;
    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  remove(id: string) {
    return `This action removes a #${id} project`;
  }
}
