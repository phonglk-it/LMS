import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Course } from "src/courses/course.entity";

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column({ type: "text", nullable: true })
  content: string;

  @Column({ nullable: true })
  videoUrl?: string;

  // 🔥 THÊM
  @Column({ nullable: true })
  pdfUrl?: string;

  @Column({ default: 0 })
  order: number;

  @ManyToOne(() => Course, (course) => course.lessons, {
    onDelete: "CASCADE",
  })
  course: Course;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

