
export enum Market {
  SPREADSHIRT = 'Spreadshirt',
  TEEPUBLIC = 'TeePublic'
}

export type ProviderType = 'mistral' | 'groq';

export interface ProviderStatus {
  isActive: boolean;
  status: 'active' | 'rate-limited' | 'error' | 'disabled';
  lastUsed?: number;
}

export interface ProviderConfig {
  mistral: ProviderStatus & { apiKey?: string };
  groq: ProviderStatus & { apiKey?: string };
}

export interface PodMetadata {
  title: string;
  description: string;
  tags: string[];
  mainTag?: string; // Specific to TeePublic
}

export interface FileItem {
  id: string;
  file: File;
  previewUrl: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  metadata?: PodMetadata;
  error?: string;
}

export interface ApiResponse {
  title: string;
  description: string;
  tags: string[];
  mainTag?: string;
}
