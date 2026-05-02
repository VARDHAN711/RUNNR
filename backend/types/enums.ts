export enum UserRole {
  CUSTOMER = 'customer',
  FREELANCER = 'freelancer',
}

export enum TaskStatus {
  OPEN = 'open',
  ASSIGNED = 'assigned',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  PENDING = 'pending',
}

export enum RequestStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

export enum NotificationType {
  STATUS_UPDATE = 'status_update',
  SYSTEM = 'system',
}
