import { 
  WebSocketGateway, 
  WebSocketServer, 
  SubscribeMessage, 
  OnGatewayConnection, 
  OnGatewayDisconnect 
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({ 
  cors: { 
    origin: '*', 
    methods: ["GET", "POST"],
    credentials: true,
  },
  namespace: '/' 
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
      console.log(`User ${userId} connected to chat`);
    }
  }

  handleDisconnect(client: Socket) {
    console.log('User disconnected from chat');
  }

    @SubscribeMessage('sendMessage')
  async handleMessage(
    client: Socket, 
    payload: { senderId: number; receiverId: number; content: string }
  ) {
    const savedMessage = await this.chatService.saveMessage(
      payload.senderId, 
      payload.receiverId, 
      payload.content
    );
    
    const responsePayload = {
      id: savedMessage.id,
      senderId: payload.senderId,
      receiverId: payload.receiverId,
      content: payload.content,
      createdAt: savedMessage.createdAt,
      isRead: false
    };

    this.server.to(`user_${payload.receiverId}`).emit('receiveMessage', responsePayload);
    
    client.emit('receiveMessage', responsePayload);
  }
}