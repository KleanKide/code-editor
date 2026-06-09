import { User } from 'src/users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ProjectMemberRole } from './project-member.entity';
import { Project } from './project.entity';

@Entity('project_invites')
export class ProjectInvite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => Project, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  project!: Project;

  @ManyToOne(() => User, {
    onDelete: 'CASCADE',
  })
  createdBy!: User;

  @Column({ unique: true })
  token!: string;

  @Column({
    type: 'enum',
    enum: ProjectMemberRole,
    default: ProjectMemberRole.EDITOR,
  })
  role!: ProjectMemberRole;

  @CreateDateColumn()
  createdAt!: Date;
}
