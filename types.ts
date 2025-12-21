
export enum Market {
  SPREADSHIRT = 'Spreadshirt',
  TEEPUBLIC = 'TeePublic'
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

export interface KeyPool {
  gemini: string[];
  mistral: string[];
  groq: string[];
}
