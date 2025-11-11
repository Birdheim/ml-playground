# ML Playground Backend - API Reference for Frontend Development

**Date:** 2025-11-11
**Backend Status:** Classification-only ML platform (Alpha)
**Base URL:** `http://localhost:8000`

---

## 📋 Table of Contents

1. [API Endpoints](#api-endpoints)
2. [Data Models & Schemas](#data-models--schemas)
3. [Project Structure](#project-structure)
4. [Key Behaviors & Constraints](#key-behaviors--constraints)
5. [Dependencies](#dependencies)
6. [Quick Start Examples](#quick-start-examples)

---

## 🌐 API Endpoints

### Health Check

#### **GET /**
Root health check endpoint.

**Request:** None
**Response:**
```json
{
  "message": "backend is up and running"
}
```

**Usage:**
```javascript
fetch('http://localhost:8000/')
  .then(res => res.json())
  .then(data => console.log(data.message))
```

---

### Dataset Management

#### **GET /list-datasets**
Returns all available datasets (builtin + user-uploaded).

**Location:** `backend/routes/dataset_api.py:9-17`

**Request:** None

**Response:**
```json
{
  "datasets": [
    "iris",           // builtin
    "wine",           // builtin
    "breast_cancer",  // builtin
    "my_dataset"      // uploaded
  ]
}
```

**Builtin Datasets:**
- `iris` - Iris flower classification (150 samples, 4 features, 3 classes)
- `wine` - Wine classification (178 samples, 13 features, 3 classes)
- `breast_cancer` - Breast cancer classification (569 samples, 30 features, 2 classes)

**Usage:**
```javascript
fetch('http://localhost:8000/list-datasets')
  .then(res => res.json())
  .then(data => {
    const allDatasets = data.datasets;
    // First 3 are always builtin, rest are user uploads
  })
```

---

#### **GET /dataset-preview/{name}**
Get metadata and sample rows from a dataset.

**Location:** `backend/routes/dataset_api.py:19-35`

**Parameters:**
- `name` (path): Dataset name (e.g., "iris", "my_dataset")
- `preview_size` (query, required): Number of samples to return (must be > 0)

**Response (Success 200):**
```json
{
  "n_samples": 150,
  "n_features": 4,
  "n_classes": 3,
  "samples": [
    {
      "sepal length (cm)": 5.1,
      "sepal width (cm)": 3.5,
      "petal length (cm)": 1.4,
      "petal width (cm)": 0.2,
      "target": 0
    },
    // ... more samples
  ]
}
```

**Response (Error 404):**
```json
{
  "detail": "Dataset 'unknown' not found"
}
```

**Response (Error 400):**
```json
{
  "detail": "Dataset iris does not have 1000 data entries"
}
```

**Usage:**
```javascript
fetch('http://localhost:8000/dataset-preview/iris?preview_size=10')
  .then(res => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  })
  .then(data => {
    console.log(`Dataset has ${data.n_samples} samples`);
    console.log(`First few rows:`, data.samples);
  })
```

**Important:**
- Samples are randomly selected with `random_state=42` (consistent on refresh)
- All features + target column are included in samples
- Feature names are preserved from original dataset

---

#### **POST /upload-dataset**
Upload a CSV file as a new dataset.

**Location:** `backend/routes/dataset_api.py:38-79`

**Request (multipart/form-data):**
- `dataset` (file): CSV file
- `name` (string): Dataset name (used for identification)

**CSV Requirements:**
- Must have a column named `target`
- Target must have at least 2 distinct classes
- At least one feature column (besides target)
- No missing values in features
- No missing values in target

**Response (Success 200):**
```json
{
  "message": "Dataset 'my_dataset' uploaded successfully",
  "rows": 100,
  "features": 5
}
```

**Response (Error 400):**
```json
{
  "detail": "Dataset must include 'target' column."
}
// or
{
  "detail": "Target must have at least 2 distinct classes."
}
// or
{
  "detail": "Dataset must include at least one feature column."
}
// or
{
  "detail": "Feature data contains missing values."
}
// or
{
  "detail": "Target column contains missing values."
}
```

**Response (Error 500):**
```json
{
  "detail": "Failed to process dataset: [error details]"
}
```

**Usage (Browser FormData):**
```javascript
const formData = new FormData();
formData.append('dataset', fileInput.files[0]);
formData.append('name', 'my_custom_dataset');

fetch('http://localhost:8000/upload-dataset', {
  method: 'POST',
  body: formData
})
  .then(res => res.json())
  .then(data => {
    console.log(data.message);
    console.log(`Uploaded ${data.rows} rows with ${data.features} features`);
  })
```

**Storage:**
- Files saved to `backend/datasets/{name}.csv`
- Overwrites if name already exists
- No versioning or history tracking

---

### Training

#### **POST /train**
Train a classification model on a specified dataset.

**Location:** `backend/routes/train_api.py:7-34`

**Request Body (JSON):**
```json
{
  "model_name": "logistic_regression",  // or "svm", "knn", "decision_tree"
  "dataset_name": "iris",
  "hyperparameters": {
    // Model-specific parameters (see schemas below)
  }
}
```

**Supported Models & Hyperparameters:**

**1. Logistic Regression** (`model_name: "logistic_regression"`)
```json
{
  "model_name": "logistic_regression",
  "dataset_name": "iris",
  "hyperparameters": {
    "C": 1.0,           // Inverse regularization strength (float)
    "max_iter": 100     // Maximum iterations (int)
  }
}
```

**2. Support Vector Machine** (`model_name: "svm"`)
```json
{
  "model_name": "svm",
  "dataset_name": "wine",
  "hyperparameters": {
    "C": 1.0,           // Regularization parameter (float)
    "kernel": "rbf"     // "linear", "poly", "rbf", or "sigmoid"
  }
}
```

**3. K-Nearest Neighbors** (`model_name: "knn"`)
```json
{
  "model_name": "knn",
  "dataset_name": "breast_cancer",
  "hyperparameters": {
    "n_neighbors": 5,           // Number of neighbors (int)
    "whieghts": "uniform"       // "uniform" or "distance" [NOTE: typo in backend]
  }
}
```

**4. Decision Tree** (`model_name: "decision_tree"`)
```json
{
  "model_name": "decision_tree",
  "dataset_name": "iris",
  "hyperparameters": {
    "max_depth": null,        // Max depth (int or null for unlimited)
    "criterion": "gini"       // "gini", "entropy", or "log_loss"
  }
}
```

**Response (Success 200):**
```json
{
  "accuracy": 0.9666666666666667
}
```

**Response (Error 400):**
```json
{
  "detail": "Unsupported dataset: unknown_dataset"
}
// or
{
  "detail": "Invalid hyperparameters for svm: [details]"
}
```

**Response (Error 500):**
```json
{
  "detail": "Unexpected server error"
}
```

**Usage:**
```javascript
fetch('http://localhost:8000/train', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model_name: 'svm',
    dataset_name: 'iris',
    hyperparameters: {
      C: 1.0,
      kernel: 'rbf'
    }
  })
})
  .then(res => res.json())
  .then(data => {
    console.log(`Model accuracy: ${(data.accuracy * 100).toFixed(2)}%`);
  })
```

**Important Behaviors:**
- Train/test split: 80/20
- Random state: Fixed at 42 (reproducible but not configurable)
- Model is trained but **NOT SAVED** (ephemeral)
- Only accuracy metric is returned
- Training is synchronous (blocks until complete)

---

## 📦 Data Models & Schemas

All schemas located in: `backend/schemas/train_schema.py`

### Request Models

#### **LogisticRegressionParams**
```python
class LogisticRegressionParams(BaseModel):
    C: float              # Inverse regularization strength
    max_iter: int         # Maximum iterations
```

#### **SVMParams**
```python
class SVMParams(BaseModel):
    C: float                                          # Regularization parameter
    kernel: Literal["linear", "poly", "rbf", "sigmoid"]  # Kernel type
```

#### **KNNParams**
```python
class KNNParams(BaseModel):
    n_neighbors: int                          # Number of neighbors
    whieghts: Literal["uniform", "distance"]  # Weight function (NOTE: typo)
    # Default: "uniform"
```

#### **DecisionTreeParams**
```python
class DecisionTreeParams(BaseModel):
    max_depth: Optional[int] = None              # Max depth (None = unlimited)
    criterion: Literal["gini", "entropy", "log_loss"] = "gini"  # Split criterion
```

#### **TrainRequest (Discriminated Union)**
```python
TrainRequest = Union[
    LogisticRegressionRequest,
    SVMRequest,
    KNNRequest,
    DecisionTreeRequest
]
```

Each specific request includes:
- `model_name`: Literal type (used as discriminator)
- `dataset_name`: str
- `hyperparameters`: Corresponding params class

**Example:**
```python
{
  "model_name": "svm",           # Discriminator - determines which schema
  "dataset_name": "iris",
  "hyperparameters": {
    "C": 1.0,
    "kernel": "rbf"
  }
}
```

### Response Models

Currently, responses are simple dictionaries (no Pydantic models):

**Health Check Response:**
```typescript
{
  message: string
}
```

**List Datasets Response:**
```typescript
{
  datasets: string[]
}
```

**Dataset Preview Response:**
```typescript
{
  n_samples: number,
  n_features: number,
  n_classes: number,
  samples: Array<Record<string, number>>  // Dynamic keys based on dataset
}
```

**Upload Dataset Response:**
```typescript
{
  message: string,
  rows: number,
  features: number
}
```

**Train Response:**
```typescript
{
  accuracy: number  // Float between 0 and 1
}
```

---

## 📁 Project Structure

```
ml-playground/
├── backend/                          # FastAPI backend application
│   ├── main.py                       # App entry point, CORS config, router registration
│   ├── requirements.txt              # Python dependencies
│   │
│   ├── routes/                       # API endpoint definitions
│   │   ├── dataset_api.py           # Dataset endpoints (list, preview, upload)
│   │   └── train_api.py             # Training endpoint
│   │
│   ├── schemas/                      # Pydantic models for request/response validation
│   │   └── train_schema.py          # Training request models (all 4 model types)
│   │
│   ├── services/                     # Business logic layer
│   │   ├── builtin_datasets.py      # Dict mapping names to sklearn dataset loaders
│   │   ├── dataset_registry.py      # Dataset management (save/load/list/preview)
│   │   └── model_trainer.py         # Model training logic
│   │
│   ├── datasets/                     # User-uploaded datasets (created at runtime)
│   │   └── example_dataset.csv      # Example CSV with proper format
│   │
│   └── .vscode/                      # Editor config
│       └── settings.json            # Python interpreter path
│
├── README.md                         # Project overview and setup instructions
└── .gitignore                        # Git ignore rules
```

### File Descriptions

**`backend/main.py`** (21 lines)
- FastAPI app initialization
- CORS middleware (allows all origins)
- Router registration
- Root health check endpoint

**`backend/routes/dataset_api.py`** (79 lines)
- GET `/list-datasets` - Returns builtin + uploaded datasets
- GET `/dataset-preview/{name}` - Sample data with metadata
- POST `/upload-dataset` - CSV upload with validation

**`backend/routes/train_api.py`** (34 lines)
- POST `/train` - Train classification model
- Delegates to `model_trainer.train_model()`

**`backend/schemas/train_schema.py`** (55 lines)
- Pydantic models for all 4 model types
- Uses discriminated union pattern
- Type-safe hyperparameter validation

**`backend/services/builtin_datasets.py`** (7 lines)
- Dictionary: `{"iris": load_iris, "wine": load_wine, "breast_cancer": load_breast_cancer}`
- All return sklearn Bunch objects

**`backend/services/dataset_registry.py`** (78 lines)
- `save_dataset()` - Save DataFrame to CSV
- `load_dataset()` - Load CSV to DataFrame
- `list_datasets()` - List uploaded dataset names
- `get_dataset()` - Unified interface for builtin + uploaded
- `get_dataset_preview()` - Sample rows with metadata

**`backend/services/model_trainer.py`** (53 lines)
- `train_model()` - Main training function
- Validates dataset and model names
- Performs train/test split
- Trains model and returns accuracy
- **Does not persist models**

---

## ⚙️ Key Behaviors & Constraints

### Dataset Constraints

**CSV Upload Requirements:**
1. Must have a column named exactly `target`
2. Target must have ≥ 2 distinct values (classification)
3. Must have ≥ 1 feature column (besides target)
4. No missing values allowed (features or target)
5. All feature values must be numeric

**Example Valid CSV:**
```csv
feature1,feature2,feature3,target
1.0,2.5,3.1,0
2.1,3.2,1.3,1
0.9,1.8,2.7,0
```

**Storage:**
- Saved to `backend/datasets/{name}.csv`
- Name overwrites existing files (no conflict handling)
- Directory created on first upload

### Training Constraints

**Fixed Parameters:**
- Train/test split: 80/20
- Random state: 42 (hardcoded)
- Stratification: None
- Scoring: Accuracy only

**Model Lifecycle:**
- Models trained in-memory
- Not saved to disk
- Cannot be reloaded for prediction
- Each training creates a new model instance

**Performance:**
- Synchronous (blocks API during training)
- No timeout configured
- Small datasets (<1000 samples) train in <1s
- Larger datasets may cause timeout issues

### Data Flow

```
Frontend Upload
    ↓
POST /upload-dataset
    ↓
Validation (target, classes, missing values)
    ↓
Save to backend/datasets/{name}.csv
    ↓
Return metadata
```

```
Frontend Train Request
    ↓
POST /train
    ↓
Load dataset (builtin or uploaded)
    ↓
Initialize model with hyperparameters
    ↓
train_test_split (80/20, random_state=42)
    ↓
model.fit(X_train, y_train)
    ↓
accuracy = model.score(X_test, y_test)
    ↓
Return {accuracy: float}
```

### Error Handling

**Dataset Errors:**
- 404: Dataset not found
- 400: Validation failed (missing target, wrong format, missing values)
- 500: Unexpected processing error

**Training Errors:**
- 400: Invalid dataset name, invalid hyperparameters
- 500: Generic "Unexpected server error" (hides actual error)

**Note:** 500 errors don't expose details to client (security measure)

---

## 📚 Dependencies

From `backend/requirements.txt`:

```txt
fastapi==0.116.0          # Web framework
uvicorn==0.35.0           # ASGI server
pydantic==2.11.7          # Data validation
python-multipart==0.0.20  # File upload support
pandas==2.3.1             # Data manipulation
scikit-learn==1.7.0       # ML models
numpy==2.3.1              # Numerical computing
```

**Notable Absences:**
- No plotting libraries (matplotlib, seaborn)
- No model persistence libraries (beyond sklearn's built-in)
- No database (datasets stored as CSV files)
- No XGBoost, LightGBM (only sklearn models)

---

## 🚀 Quick Start Examples

### 1. Check Backend Health
```bash
curl http://localhost:8000/
```

### 2. List Available Datasets
```bash
curl http://localhost:8000/list-datasets
```

### 3. Preview Iris Dataset
```bash
curl "http://localhost:8000/dataset-preview/iris?preview_size=5"
```

### 4. Upload Custom Dataset
```bash
curl -X POST http://localhost:8000/upload-dataset \
  -F "dataset=@my_data.csv" \
  -F "name=my_dataset"
```

### 5. Train Logistic Regression
```bash
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "logistic_regression",
    "dataset_name": "iris",
    "hyperparameters": {
      "C": 1.0,
      "max_iter": 100
    }
  }'
```

### 6. Train SVM with RBF Kernel
```bash
curl -X POST http://localhost:8000/train \
  -H "Content-Type: application/json" \
  -d '{
    "model_name": "svm",
    "dataset_name": "wine",
    "hyperparameters": {
      "C": 2.0,
      "kernel": "rbf"
    }
  }'
```

---

## 🎯 Frontend Development Recommendations

### State Management Needs

**Application State:**
- List of available datasets (refresh on upload)
- Currently selected dataset
- Dataset preview data
- Training history (store client-side)

**Form State:**
- Selected model type
- Hyperparameter values (dynamic based on model)
- Upload file + dataset name

### UI Components Needed

1. **Dataset Selector**
   - Dropdown with builtin + uploaded datasets
   - Visual distinction between types

2. **Dataset Upload Form**
   - File input (CSV only)
   - Text input for dataset name
   - Validation feedback

3. **Dataset Preview Panel**
   - Metadata display (samples, features, classes)
   - Data table with sample rows

4. **Model Configuration Form**
   - Model type selector (4 options)
   - Dynamic hyperparameter inputs (changes with model)
   - Input validation (types, ranges)

5. **Training Results Display**
   - Accuracy percentage
   - History/comparison table

### Error Handling

**Display user-friendly messages for:**
- 404: "Dataset not found. Please check the name or upload again."
- 400 (missing target): "Your CSV must have a 'target' column."
- 400 (single class): "Target column needs at least 2 different values."
- 400 (missing values): "Please remove rows with missing data."
- 500: "Something went wrong. Please try again."

### TypeScript Interfaces

```typescript
// API Responses
interface HealthResponse {
  message: string;
}

interface ListDatasetsResponse {
  datasets: string[];
}

interface DatasetPreviewResponse {
  n_samples: number;
  n_features: number;
  n_classes: number;
  samples: Record<string, number>[];
}

interface UploadDatasetResponse {
  message: string;
  rows: number;
  features: number;
}

interface TrainResponse {
  accuracy: number;
}

// Train Requests
type ModelName = 'logistic_regression' | 'svm' | 'knn' | 'decision_tree';

interface LogisticRegressionHyperparameters {
  C: number;
  max_iter: number;
}

interface SVMHyperparameters {
  C: number;
  kernel: 'linear' | 'poly' | 'rbf' | 'sigmoid';
}

interface KNNHyperparameters {
  n_neighbors: number;
  whieghts: 'uniform' | 'distance';  // Note: backend typo
}

interface DecisionTreeHyperparameters {
  max_depth: number | null;
  criterion: 'gini' | 'entropy' | 'log_loss';
}

type Hyperparameters =
  | LogisticRegressionHyperparameters
  | SVMHyperparameters
  | KNNHyperparameters
  | DecisionTreeHyperparameters;

interface TrainRequest {
  model_name: ModelName;
  dataset_name: string;
  hyperparameters: Hyperparameters;
}
```

---

## ⚠️ Known Issues & Limitations

1. **Typo in KNN schema**: `whieghts` should be `weights` (backend bug)
2. **No model persistence**: Cannot make predictions on trained models
3. **No async training**: Long training blocks the API
4. **Generic error messages**: 500 errors hide details
5. **No CORS restrictions**: Security issue for production
6. **Hardcoded random_state**: Cannot customize for reproducibility
7. **No cross-validation**: Only single train/test split
8. **Accuracy only**: No precision, recall, F1, confusion matrix
9. **No dataset deletion**: Uploaded datasets persist forever
10. **No name validation**: Can overwrite datasets by name collision

---

## 📞 Need More Info?

**Backend Code Locations:**
- API Routes: `backend/routes/`
- Schemas: `backend/schemas/train_schema.py`
- Business Logic: `backend/services/`
- Main App: `backend/main.py`

**FastAPI Auto-Generated Docs:**
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**Maintainer:** Herman Bergheim
