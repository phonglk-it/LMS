import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CoursesModule } from './courses/courses.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { LessonModule } from './lesson/lesson.module';
import { ChatModule } from './chat/chat.module';
import { PaymentModule } from './payment/payment.module';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'root',
      password: '',
      database: 'lms_db',
      autoLoadEntities: true,
      synchronize: true,
    }),

    // ✅ FIX CHUẨN SMTP GMAIL
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'kimphong7891@gmail.com', // 👈 thay bằng email thật
          pass: 'eugy zbdh aqft zous',    // 👈 App Password 16 ký tự
        },
      },
      defaults: {
        from: '"Edurio Support" <kimphong7891@gmail.com>', // 👈 PHẢI TRÙNG
      },
    }),

    UsersModule,
    AuthModule,
    CoursesModule,
    EnrollmentsModule,
    LessonModule,
    ChatModule,
    PaymentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}