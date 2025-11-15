import type {
  DatasetPreviewResponse,
  ListDatasetsResponse,
  UploadDatasetResponse,
  TrainRequest,
  TrainResponse,
} from '../types/api.ts';

const BASE_URL = 'http://localhost:8000';

/**
 * API client for ML Playground backend
 */

export const api = {
  /**
   * Health check endpoint
   */
  async healthCheck(): Promise<{message: string}> {
    const response = await fetch(`${BASE_URL}/`);
    if (!response.ok) {
      throw new Error('Backend is not running')
    }
    return response.json()
  },

  /**
   * Get list of all datasets (builtin + uploaded)
   */
  async listDatasets(): Promise<ListDatasetsResponse> {
    const response = await fetch(`${BASE_URL}/list-datasets`);
    if (!response.ok){
      throw new Error('Failed to fetch datasets')
    }
    return response.json()
  },
  
  /**
   * Get preview of a specific dataset
   * @param name - Dataset name
   * @param previewSize - Number og rows to preview (default: 10)
   */
  async previewDataset(
    name: string,
    previewSize: number = 10,
  ): Promise<DatasetPreviewResponse> {
    const response = await fetch(
      `${BASE_URL}/dataset-preview/${name}?preview_size=${previewSize}`
    );
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Failed to preview dataset')
    }
    return response.json();
  },

  /**
   * Upload a new datast
   * @param file - CSV file
   * @param name -- Dataset name
   */
  async uploadDataset(
    file: File,
    name: string,
  ): Promise<UploadDatasetResponse> {
    const formData = new FormData();
    formData.append('dataset', file);
    formData.append('name', name);

    const response = await fetch(`${BASE_URL}/upload-dataset`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Failed to upload dataset')
    }
    return response.json()
  },

  /**
   * Train a model
   * @param request - Training configuration
   */
  async train(request: TrainRequest): Promise<TrainResponse> {
    const response = await fetch(`${BASE_URL}/train`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail || 'Training failed')
    }
    return response.json()
  },
};
