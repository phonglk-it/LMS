import { IsString, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsNumber()
  @Type(() => Number)
  order: number;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  pdfUrl?: string;

  @IsNumber()
  @Type(() => Number)
  courseId: number;
}
