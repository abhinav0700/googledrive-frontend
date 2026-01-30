import axios, { AxiosInstance, AxiosError } from 'axios';
import { AuthResponse, FileItem, Folder, LoginForm, RegisterForm, User } from '@/types';

// Configure your backend API URL here
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add auth token to requests
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Handle response errors
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async register(data: RegisterForm): Promise<AuthResponse> {
    const response = await this.client.post('/auth/register', data);
    return response.data;
  }

  async login(data: LoginForm): Promise<AuthResponse> {
    const response = await this.client.post('/auth/login', data);
    return response.data;
  }

  async activateAccount(token: string): Promise<AuthResponse> {
    const response = await this.client.get(`/auth/activate/${token}`);
    return response.data;
  }

  async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post('/auth/forgot-password', { email });
    return response.data;
  }

  async resetPassword(token: string, password: string): Promise<AuthResponse> {
    const response = await this.client.post('/auth/reset-password', { token, password });
    return response.data;
  }

  async getProfile(): Promise<User> {
    const response = await this.client.get('/auth/profile');
    return response.data;
  }

  // Folder endpoints
  async getFolders(parentId?: string): Promise<Folder[]> {
    const params = parentId ? { parent: parentId } : {};
    const response = await this.client.get('/folders', { params });
    return response.data;
  }

  async createFolder(name: string, parentId?: string): Promise<Folder> {
    const response = await this.client.post('/folders', { name, parentFolder: parentId });
    return response.data;
  }

  async deleteFolder(folderId: string): Promise<void> {
    await this.client.delete(`/folders/${folderId}`);
  }

  async renameFolder(folderId: string, name: string): Promise<Folder> {
    const response = await this.client.patch(`/folders/${folderId}`, { name });
    return response.data;
  }

  // File endpoints
  async getFiles(folderId?: string): Promise<FileItem[]> {
    const params = folderId ? { folder: folderId } : {};
    const response = await this.client.get('/files', { params });
    return response.data;
  }

  async uploadFile(file: File, folderId?: string, onProgress?: (progress: number) => void): Promise<FileItem> {
    const formData = new FormData();
    formData.append('file', file);
    if (folderId) {
      formData.append('folderId', folderId);
    }

    const response = await this.client.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total && onProgress) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  async deleteFile(fileId: string): Promise<void> {
    await this.client.delete(`/files/${fileId}`);
  }

  async renameFile(fileId: string, name: string): Promise<FileItem> {
    const response = await this.client.patch(`/files/${fileId}`, { name });
    return response.data;
  }

  async downloadFile(fileId: string): Promise<Blob> {
    const response = await this.client.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  async getDownloadUrl(fileId: string): Promise<{ url: string }> {
    const response = await this.client.get(`/files/${fileId}/download-url`);
    return response.data;
  }
}

export const api = new ApiService();
export default api;
