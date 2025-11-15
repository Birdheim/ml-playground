// Dataset Types
export interface DatasetPreviewResponse {
    n_samples: number;
    n_features: number;
    n_classes: number;
    samples: Record<string, number>[];
}

export interface ListDatasetsResponse {
    datasets: string[];
}

export interface UploadDatasetResponse {
  message: string;
  rows: number;
  features: number;
}

// Training Types
export type ModelName = 
  | 'logistic_regression' 
  | 'svm' 
  | 'knn' 
  | 'decision_tree';

// Base hyperparameters
interface LogisticRegressionParams {
  C: number;
  max_iter: number;
}

interface SVMParams {
  C: number;
  kernel: 'linear' | 'poly' | 'rbf' | 'sigmoid';
}

interface KNNParams {
  n_neighbors: number;
  whieghts: 'uniform' | 'distance';  // Note: typo in backend
}

interface DecisionTreeParams {
  max_depth: number | null;
  criterion: 'gini' | 'entropy' | 'log_loss';
}

// Union type for all hyperparameters
export type Hyperparameters = 
  | LogisticRegressionParams
  | SVMParams
  | KNNParams
  | DecisionTreeParams;

export interface TrainRequest {
  model_name: ModelName;
  dataset_name: string;
  hyperparameters: Hyperparameters;
}

export interface TrainResponse {
  accuracy: number;
}

// ===== UI STATE TYPES =====

export interface TrainingRecord {
  id: string;
  timestamp: Date;
  modelName: ModelName;
  datasetName: string;
  hyperparameters: Hyperparameters;
  accuracy: number;
}