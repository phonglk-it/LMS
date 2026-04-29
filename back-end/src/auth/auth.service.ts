import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  // ================= REGISTER =================
  async register(dto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(dto.email);
    if (existingUser) {
      throw new BadRequestException('Email already exists');
    }

    // Hash password with 10 salt rounds
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.usersService.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
    });

    return { message: 'Register successfully', userId: user.id };
  }

  // ================= LOGIN =================
  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    // Compare plain text password with hashed password from DB
    const isMatch = await bcrypt.compare(dto.password, user.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const accessToken = this.jwtService.sign({
      sub: user.id,
      role: user.role,
    });

    return {
      message: 'Login successfully',
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }

  // ================= FORGOT PASSWORD =================
  async forgotPassword(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User with this email does not exist');
    }

    const resetToken = this.jwtService.sign(
      { sub: user.id, email: user.email, type: 'reset' },
      { expiresIn: '15m' },
    );

    // Make sure the path matches your Frontend structure: /auth/reset-password
    const resetLink = `http://localhost:3000/auth/reset-password?token=${resetToken}`;

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: '[Edurio] Password Reset Request',
        html: `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
            <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
              <h2 style="color: #4F46E5; text-align: center;">Reset Your Password</h2>
              <p>Hi <b>${user.fullName}</b>,</p>
              <p>We received a request to reset your password. If you didn't make this request, please ignore this email.</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetLink}" 
                   style="background-color: #4F46E5; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">
                   Reset Password
                </a>
              </div>
              <p style="font-size: 13px; color: #666;">This link expires in 15 minutes.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="font-size: 12px; color: #999; text-align: center;">&copy; 2026 Edurio LMS</p>
            </div>
          </div>
        `,
      });

      return { message: 'Reset password email sent' };
    } catch (error) {
      console.error(' MAIL ERROR:', error);
      throw new BadRequestException('Failed to send email');
    }
  }

  // ================= RESET PASSWORD =================
  async resetPassword(token: string, newPassword: string) {
    try {
      const payload = this.jwtService.verify(token);

      if (payload.type !== 'reset') {
        throw new BadRequestException('Invalid token type');
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);


      await this.usersService.updateById(payload.sub, {
        password: hashedPassword,
      });

      console.log(`Password for User ID ${payload.sub} has been updated successfully.`);
      return { message: 'Password updated successfully' };
    } catch (e) {
      console.error('❌ RESET ERROR:', e.message);
      throw new BadRequestException('Token invalid or expired');
    }
  }
}