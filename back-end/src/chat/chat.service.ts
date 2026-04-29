import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,
  ) {}

  async saveMessage(senderId: number, receiverId: number, content: string) {
    const newMessage = this.messageRepository.create({
      sender: { id: senderId } as any,
      receiver: { id: receiverId } as any,
      content,
      isRead: false,
    });
    return await this.messageRepository.save(newMessage);
  }

    async markRead(currentUserId: number, partnerId: number) {
    return await this.messageRepository.update(
      { 
        sender: { id: partnerId }, 
        receiver: { id: currentUserId }, 
        isRead: false 
      },
      { isRead: true }
    );
  }

  async getChatHistory(user1Id: number, user2Id: number) {
    const messages = await this.messageRepository.find({
      where: [
        { sender: { id: user1Id }, receiver: { id: user2Id } },
        { sender: { id: user2Id }, receiver: { id: user1Id } },
      ],
      order: { createdAt: 'ASC' },
      relations: ['sender', 'receiver'],
    });

    return messages.map(msg => ({
      ...msg,
      senderId: msg.sender?.id,
      receiverId: msg.receiver?.id,
    }));
  } 
}