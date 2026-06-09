import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Project } from './project.entity';

export enum ProjectMemberRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

@Entity('project_members')
@Unique(['project', 'user'])
export class ProjectMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Project, (project) => project.members, {
    onDelete: 'CASCADE',
  })
  project!: Project;

  @ManyToOne(() => User, (user) => user.projectMemberships, {
    onDelete: 'CASCADE',
  })
  user!: User;

  @Column({
    type: 'enum',
    enum: ProjectMemberRole,
    default: ProjectMemberRole.EDITOR,
  })
  role!: ProjectMemberRole;

  @CreateDateColumn()
  createdAt!: Date;
}
