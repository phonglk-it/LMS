import { 
  Controller, 
  Post, 
  Param, 
  UseGuards, 
  Req, 
  Body,
  NotFoundException, 
  InternalServerErrorException, 
  BadRequestException,
  HttpCode,
  HttpStatus
} from '@nestjs/common';

import { MomoService } from './momo.service';
import { CoursesService } from '../courses/courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EnrollmentsService } from '../enrollments/enrollments.service';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly momoService: MomoService,
    private readonly coursesService: CoursesService,
    private readonly enrollmentsService: EnrollmentsService,
  ) {}

  // ================= INIT PAYMENT =================
  @UseGuards(JwtAuthGuard)
  @Post('momo/:id')
  async createMomoPayment(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      throw new BadRequestException('User information not found in token');
    }

    const courseId = Number(id);
    if (isNaN(courseId)) {
      throw new BadRequestException('Invalid course ID');
    }

    const course = await this.coursesService.findOnePublic(courseId);
    if (!course) {
      throw new NotFoundException(`Course not found with ID: ${courseId}`);
    }

    if (!course.price || course.price < 1000) {
      throw new BadRequestException('Course price must be at least 1000 VND');
    }

    try {
      console.log(`[Payment] User ${userId} buying Course ${courseId}`);

      return await this.momoService.createPayment(
        courseId,
        userId,
        course.price,
      );
    } catch (error) {
      console.error('PaymentController Error:', error.message);
      throw new InternalServerErrorException(error.message);
    }
  }

  // ================= WEBHOOK =================
  @Post('webhook')
  @HttpCode(HttpStatus.NO_CONTENT)
  async handleMomoWebhook(@Body() payload: any) {
    console.log('--- MOMO WEBHOOK ---');
    console.log(JSON.stringify(payload, null, 2));

    const { resultCode, orderId } = payload;

    if (resultCode === 0) {
      try {
        const parts = orderId.split('-');

        if (parts.length < 3) {
          console.error('Invalid orderId format');
          return;
        }

        const courseId = Number(parts[1]);
        const userId = Number(parts[2]);

        console.log(`[SUCCESS] course=${courseId}, user=${userId}`);

        // ✅ VERY IMPORTANT: tránh duplicate
        const existing = await this.enrollmentsService.findOne(
          courseId,
          userId,
        );

        if (!existing) {
          await this.enrollmentsService.enrollAfterPayment(
            courseId,
            userId,
          );
          console.log('Enrollment created');
        } else {
          console.log('Already enrolled, skip');
        }

      } catch (error) {
        console.error('[Webhook Error]:', error.message);
      }
    } else {
      console.warn(`[FAILED] orderId=${orderId}, code=${resultCode}`);
    }
  }
}