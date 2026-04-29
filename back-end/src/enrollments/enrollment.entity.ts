import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';

import { User } from '../users/user.entity';
import { Course } from '../courses/course.entity';

@Entity()
export class Enrollment {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.enrollments, {
    onDelete: 'CASCADE',
  })
  student: User;

  @ManyToOne(() => Course, {
    onDelete: 'CASCADE',
  })
  course: Course;

  @CreateDateColumn()
  enrolledAt: Date;
}
