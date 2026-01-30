// User types
export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

// File & Folder types
export interface FileItem {
  _id: string;
  userId: string;
  name: string;
  s3Key: string;
  folderPath: string;
  size: number;
  mimeType: string;
  createdAt: string;
  updatedAt?: string;
}

export interface Folder {
  _id: string;
  userId: string;
  name: string;
  parentFolder: string | null;
  path: string;
  createdAt: string;
}

export type FileType = 'folder' | 'document' | 'image' | 'video' | 'audio' | 'other';

export interface BreadcrumbItem {
  id: string;
  name: string;
  path: string;
}

// API types
export interface ApiError {
  message: string;
  status?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordForm {
  email: string;
}

export interface ResetPasswordForm {
  password: string;
  confirmPassword: string;
  token: string;
}
