export interface UserDTO {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  userType: string;
}

export interface Conversation {
  id: number;
  otherParticipant: UserDTO;
  lastUpdated: string;
  lastMessagePreview: string;
}

export interface Message {
  id?: number;
  senderId: number;
  content: string;
  timestamp?: string;
  isRead?: boolean;
}

export interface SendMessageDTO {
  senderId: number;
  receiverId: number;
  content: string;
}
