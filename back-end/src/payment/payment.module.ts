import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { MomoService } from './momo.service';
import { CoursesModule } from '../courses/courses.module';
import { EnrollmentsModule } from '../enrollments/enrollments.module'; // ✅ ADD

@Module({
  imports: [
    CoursesModule,
    EnrollmentsModule
  ],
  controllers: [PaymentController],
  providers: [MomoService],
})
export class PaymentModule {}