import { Controller, Get, Param, UseGuards, Request, Post } from '@nestjs/common';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('history/:receiverId')
  async getChatHistory(@Request() req, @Param('receiverId') receiverId: string) {
    const senderId = req.user.userId || req.user.id; 
    return await this.chatService.getChatHistory(Number(senderId), Number(receiverId));
  }

 @Post('mark-read/:partnerId')
  async markAsRead(@Request() req, @Param('partnerId') partnerId: string) {
    const currentUserId = req.user.userId || req.user.id;
    return await this.chatService.markRead(Number(currentUserId), Number(partnerId));
  }
}