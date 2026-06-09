import { Project } from 'src/projects/entities/project.entity';
import { ProjectMember } from 'src/projects/entities/project-member.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ nullable: true })
  name?: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ unique: true, nullable: true })
  googleId?: string;

  @OneToMany(() => Project, (project) => project.owner)
  projects!: Project[];

  @OneToMany(() => ProjectMember, (member) => member.user)
  projectMemberships!: ProjectMember[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
