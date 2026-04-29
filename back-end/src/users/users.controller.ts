import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Param,
  Query,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

import { UsersService } from './users.service';
import { CreateInstructorDto } from 'src/auth/dto/create-instructor.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // ================= ADMIN =================

  // ✅ ROUTE MỚI: API cho Dashboard (Lấy dữ liệu thật)
  @Get('stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async getStats() {
    return this.usersService.getSystemStats();
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  async findAll(@Query('role') role?: Role) {
    const users = await this.usersService.findAll(role);
    return {
      data: users,
      total: users.length,
    };
  }

  @Get('profile/:id')
  @UseGuards(JwtAuthGuard)
  async getStudentProfile(@Param('id') id: string) {
    return this.usersService.getProfileWithEnrollments(+id);
  }

  @Post('instructor')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  createInstructor(@Body() dto: CreateInstructorDto) {
    return this.usersService.createInstructor(dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  deleteUser(@Param('id') id: string) {
    return this.usersService.deleteUser(+id);
  }

  // ================= PROFILE (INSTRUCTOR / STUDENT) =================

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return this.usersService.getProfile(req.user.userId);
  }

  @Patch('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req, file, cb) => {
          const uniqueName = Date.now() + '-' + file.originalname;
          cb(null, uniqueName);
        },
      }),
    }),
  )
  async uploadAvatar(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
  ) {
    const avatarPath = `uploads/avatars/${file.filename}`;

    return this.usersService.uploadAvatar(
      req.user.userId,
      avatarPath,
    );
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Req() req,
    @Body() dto: ChangePasswordDto,
  ) {
    const userId = req.user.userId;

    return this.usersService.changePassword(userId, dto);
  }

  @Get('students')
  @UseGuards(JwtAuthGuard)
  async findAllStudents() {
    const users = await this.usersService.findAll(Role.STUDENT);
    return { data: users };
  }

  @Get('all-instructors')
  @UseGuards(JwtAuthGuard)
  async findAllInstructors() {
    const users = await this.usersService.findAll(Role.INSTRUCTOR);
    return { data: users };
  }

  @Get('all-admins')
  @UseGuards(JwtAuthGuard)
  async findAllAdmins() {
    const users = await this.usersService.findAll(Role.ADMIN);
    return { data: users };
  }

}