export enum ReclamationStatus {
  EN_ATTENTE = 'EN_ATTENTE',
  EN_COURS = 'EN_COURS',
  RESOLUE = 'RESOLUE',
  REJETEE = 'REJETEE'
}

export enum ReclamationPriority {
  BASSE = 'BASSE',
  MOYENNE = 'MOYENNE',
  HAUTE = 'HAUTE',
  URGENTE = 'URGENTE'
}

export enum ReclamationCategory {
  TECHNIQUE = 'TECHNIQUE',
  SERVICE = 'SERVICE',
  FACTURATION = 'FACTURATION',
  SECURITE = 'SECURITE',
  FONCTIONNALITE = 'FONCTIONNALITE',
  AUTRE = 'AUTRE'
}

export enum AttachmentType {
  IMAGE = 'IMAGE',
  DOCUMENT = 'DOCUMENT',
  AUDIO = 'AUDIO',
  OTHER = 'OTHER'
}

export enum NotificationAudience {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface Reclamation {
  reclamationId: number;
  userId: number;
  subject: string;
  description: string;
  status: ReclamationStatus;
  priority: ReclamationPriority;
  category: ReclamationCategory;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string | null;
  response?: string | null;
  respondedBy?: number | null;
}

export interface CreateReclamationRequest {
  userId?: number | null;
  subject: string;
  description: string;
  priority: ReclamationPriority;
  category: ReclamationCategory;
}

export interface UpdateReclamationRequest {
  status?: ReclamationStatus | null;
  response?: string | null;
  respondedBy?: number | null;
}

export interface ReclamationAttachment {
  attachmentId: number;
  reclamationId: number;
  originalFileName: string;
  contentType: string;
  attachmentType: AttachmentType;
  size: number;
  uploadedBy: number;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface CreateCommentRequest {
  senderId?: number | null;
  parentCommentId?: number | null;
  message: string;
}

export interface ReclamationComment {
  commentId: number;
  reclamationId: number;
  parentCommentId?: number | null;
  senderId: number;
  senderRole: string;
  message: string;
  createdAt: string;
}

export interface ReclamationHistoryEvent {
  historyId: number;
  reclamationId: number;
  eventType: string;
  description: string;
  actorUserId?: number | null;
  createdAt: string;
}

export interface ReclamationNotification {
  notificationId: number;
  reclamationId?: number | null;
  notificationType: string;
  audience: NotificationAudience;
  recipientUserId?: number | null;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
