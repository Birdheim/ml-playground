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

// Model Catalogue Types
// The backend describes its own models (see services/model_catalog.py) and the
// settings form is built from that description, so adding a model there makes
// it show up here without any change to this file.

export interface NumberParam {
  name: string;
  label: string;
  help: string;
  type: 'int' | 'float';
  default: number;
  min: number;
  max: number;
}

export interface ChoiceParam {
  name: string;
  label: string;
  help: string;
  type: 'choice';
  default: string;
  options: string[];
}

export type ModelParam = NumberParam | ChoiceParam;

export interface ModelInfo {
  name: string;
  label: string;
  blurb: string;
  params: ModelParam[];
}

export interface ListModelsResponse {
  models: ModelInfo[];
}

// Training Types
export type Hyperparameters = Record<string, number | string>;

export interface TrainRequest {
  model_name: string;
  dataset_name: string;
  hyperparameters: Hyperparameters;
}

export interface Mistake {
  features: Record<string, number>;
  predicted: string;
  actual: string;
}

export interface TrainResponse {
  accuracy: number;
  n_correct: number;
  n_test: number;
  n_train: number;
  n_mistakes: number;
  mistakes: Mistake[];
  class_names: string[];
  feature_names: string[];
}
