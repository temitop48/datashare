export type Dataset = {
  id: string;
  title: string;
  description: string;
  chain: string;
  category: string;
  tags: string;
  version: string;
  blobName: string;
  fileSizeBytes: number;
  checksum: string;
  ownerAddress: string;
  uploadedByAddress?: string | null;
  isPublic: boolean;
  downloadCount: number;
  previewJson?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type DatasetListResponse = {
  success: boolean;
  count: number;
  datasets: Dataset[];
};

export type SingleDatasetResponse = {
  success: boolean;
  dataset: Dataset;
};