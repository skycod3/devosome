export interface FileDetails {
  type: string;
  size: number;
  createdAt: Date;
  dimensions?: { width: number; height: number };
}
