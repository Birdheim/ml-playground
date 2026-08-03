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

// Experiment Types
// An experiment is one question a person might actually ask, wrapped around a
// dataset. The backend catalogue (services/experiment_catalog.py) is the
// single source of truth, including for the ones that aren't built yet.

export interface ExperimentSummary {
  name: string;
  question: string;
  teaser: string;
  /** What one row is: "passenger", "flower". Beats saying "sample". */
  row_label: string;
  available: boolean;
  /** What Eve says about a locked experiment. Null when it's available. */
  eve_says: string | null;
}

export interface ListExperimentsResponse {
  experiments: ExperimentSummary[];
}

export interface ExperimentDetail {
  name: string;
  question: string;
  teaser: string;
  dataset: string;
  row_label: string;
  class_names: string[] | null;
  /** Friendlier column headings, keyed by raw column name. */
  column_labels: Record<string, string>;
  /** Display values, e.g. is_female 1 -> "female". Keys are stringified. */
  value_labels: Record<string, Record<string, string>>;
  available: boolean;
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
  /** One entry per test example, in test order: true where it was right. */
  outcomes: boolean[];
  mistakes: Mistake[];
  class_names: string[];
  feature_names: string[];
}
