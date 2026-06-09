import { User } from 'src/users/user.entity';
import { ProjectMember } from './project-member.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('Project')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text', default: '' })
  code!: string;

  @Column({ default: 'javascript' })
  language!: string;

  @ManyToOne(() => User, (user) => user.projects, {
    onDelete: 'CASCADE',
  })
  owner!: User;

  @OneToMany(() => ProjectMember, (member) => member.project)
  members!: ProjectMember[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
