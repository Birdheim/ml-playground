# ML Playground Backend - Quick Reference

**For:** Frontend developers who need fast answers
**Full docs:** See `BACKEND_API_REFERENCE.md`

---

## 🚀 Quick Start

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```

Backend runs at: `http://localhost:8000`

---

## 📡 API Endpoints Cheat Sheet

| Method | Endpoint | Purpose | Key Request | Key Response |
|--------|----------|---------|-------------|--------------|
| GET | `/` | Health check | - | `{message: string}` |
| GET | `/list-datasets` | Get all datasets | - | `{datasets: string[]}` |
| GET | `/dataset-preview/{name}?preview_size=N` | Preview dataset | Query param: `preview_size` | `{n_samples, n_features, n_classes, samples[]}` |
| POST | `/upload-dataset` | Upload CSV | FormData: `dataset` (file), `name` (string) | `{message, rows, features}` |
| POST | `/train` | Train model | JSON body (see below) | `{accuracy: number}` |

---

## 📋 Train Request Format

```json
{
  "model_name": "svm",           // "logistic_regression", "svm", "knn", "decision_tree"
  "dataset_name": "iris",        // Any dataset from /list-datasets
  "hyperparameters": {
    // Model-specific (see below)
  }
}
```

### Hyperparameters by Model

**Logistic Regression:**
```json
{"C": 1.0, "max_iter": 100}
```

**SVM:**
```json
{"C": 1.0, "kernel": "rbf"}  // kernel: "linear"|"poly"|"rbf"|"sigmoid"
```

**KNN:**
```json
{"n_neighbors": 5, "whieghts": "uniform"}  // whieghts: "uniform"|"distance" [typo in backend]
```

**Decision Tree:**
```json
{"max_depth": null, "criterion": "gini"}  // criterion: "gini"|"entropy"|"log_loss"
```

---

## 📦 CSV Upload Requirements

Your CSV must:
- Have a column named `target`
- Target has ≥ 2 distinct values
- Have ≥ 1 feature column (besides target)
- Contain no missing values
- All features are numeric

**Example valid CSV:**
```csv
feature1,feature2,feature3,target
1.0,2.5,3.1,0
2.1,3.2,1.3,1
```

---

## 🎯 Builtin Datasets

- `iris` - 150 samples, 4 features, 3 classes
- `wine` - 178 samples, 13 features, 3 classes
- `breast_cancer` - 569 samples, 30 features, 2 classes

---

## ⚠️ Important Limitations

1. **No model persistence** - Models are not saved
2. **No prediction endpoint** - Cannot make predictions on trained models
3. **Training is synchronous** - Blocks API during training
4. **Only accuracy returned** - No precision, recall, F1, etc.
5. **Fixed train/test split** - 80/20 with random_state=42
6. **Classification only** - No regression support

---

## 🛠️ TypeScript Types

```typescript
// Responses
interface ListDatasetsResponse {
  datasets: string[];
}

interface DatasetPreviewResponse {
  n_samples: number;
  n_features: number;
  n_classes: number;
  samples: Record<string, number>[];
}

interface TrainResponse {
  accuracy: number;
}

// Requests
type ModelName = 'logistic_regression' | 'svm' | 'knn' | 'decision_tree';

interface TrainRequest {
  model_name: ModelName;
  dataset_name: string;
  hyperparameters:
    | {C: number; max_iter: number}              // logistic_regression
    | {C: number; kernel: 'linear'|'poly'|'rbf'|'sigmoid'}  // svm
    | {n_neighbors: number; whieghts: 'uniform'|'distance'} // knn
    | {max_depth: number|null; criterion: 'gini'|'entropy'|'log_loss'}; // decision_tree
}
```

---

## 🔗 CORS

CORS is wide open (allows all origins) - fine for development, but needs restriction for production.

---

## 📚 Auto-Generated API Docs

- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## 🐛 Known Bugs

- **Typo**: `whieghts` in KNN params (should be `weights`)
- **Generic errors**: 500 responses hide actual error details

---

**Full Documentation:** `BACKEND_API_REFERENCE.md`
**Version:** 1.0
**Date:** 2025-11-11
