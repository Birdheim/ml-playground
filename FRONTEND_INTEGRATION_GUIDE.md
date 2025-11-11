# Frontend Integration Guide

**Purpose:** Guide for implementing the React frontend to work with the existing backend

---

## 🎯 User Flow & Required Components

### Flow 1: Dataset Selection & Preview

```
┌─────────────────┐
│ Dataset Picker  │
│ - Dropdown      │
│ - Shows builtin │
│   + uploaded    │
└────────┬────────┘
         │
         │ On selection
         ▼
┌─────────────────────┐
│ Preview Panel       │
│ - Show metadata     │
│   (samples/features)│
│ - Display 10 rows   │
│ - Table format      │
└─────────────────────┘
```

**API Calls:**
1. On mount: `GET /list-datasets` → Populate dropdown
2. On selection: `GET /dataset-preview/{name}?preview_size=10` → Show preview

---

### Flow 2: Upload New Dataset

```
┌──────────────────┐
│ Upload Form      │
│ - File input     │
│ - Name input     │
│ - Upload button  │
└────────┬─────────┘
         │
         │ On submit
         ▼
┌──────────────────┐
│ Validation       │
│ - Check CSV      │
│ - Check name     │
└────────┬─────────┘
         │
         │ POST /upload-dataset
         ▼
┌──────────────────┐
│ Success/Error    │
│ - Show message   │
│ - Refresh list   │
│ - Select new DS  │
└──────────────────┘
```

**Validation (Frontend):**
- File type: `.csv` only
- File size: Reasonable limit (e.g., 10MB)
- Dataset name: Non-empty, alphanumeric + underscores

**Validation (Backend handles):**
- CSV structure
- Target column presence
- Missing values
- Class count

---

### Flow 3: Model Training

```
┌──────────────────┐
│ Model Selector   │
│ - 4 radio buttons│
│   or dropdown    │
└────────┬─────────┘
         │
         │ On model change
         ▼
┌────────────────────┐
│ Hyperparameters    │
│ - Dynamic form     │
│ - Changes per model│
│ - Validation       │
└────────┬───────────┘
         │
         │ On train click
         ▼
┌────────────────────┐
│ Training           │
│ - Show spinner     │
│ - Disable form     │
└────────┬───────────┘
         │
         │ POST /train
         ▼
┌────────────────────┐
│ Results Display    │
│ - Show accuracy    │
│ - Add to history   │
│ - Allow comparison │
└────────────────────┘
```

**Model Configuration UI:**

```
Model: [Logistic Regression ▼]

Hyperparameters:
┌────────────────────────────┐
│ C:                [1.0   ] │
│ Max Iterations:   [100   ] │
└────────────────────────────┘

Dataset: [iris ▼]

[Train Model]
```

---

## 🎨 Component Architecture

### Suggested Component Tree

```
App
├── Header
├── DatasetSection
│   ├── DatasetUpload
│   │   ├── FileInput
│   │   └── NameInput
│   ├── DatasetSelector (Dropdown)
│   └── DatasetPreview
│       ├── MetadataDisplay
│       └── SampleTable
├── TrainingSection
│   ├── ModelSelector
│   ├── HyperparameterForm (Dynamic)
│   │   ├── LogisticRegressionParams
│   │   ├── SVMParams
│   │   ├── KNNParams
│   │   └── DecisionTreeParams
│   └── TrainButton
└── ResultsSection
    ├── CurrentResult
    └── TrainingHistory
```

---

## 📊 State Management

### Application State (Context or Redux)

```typescript
interface AppState {
  // Datasets
  availableDatasets: string[];
  selectedDataset: string | null;
  datasetPreview: DatasetPreviewResponse | null;

  // Training
  selectedModel: ModelName;
  hyperparameters: Hyperparameters;
  isTraining: boolean;

  // Results
  currentResult: TrainResponse | null;
  trainingHistory: TrainingRecord[];

  // UI
  uploadModalOpen: boolean;
  error: string | null;
}

interface TrainingRecord {
  id: string;
  timestamp: Date;
  modelName: ModelName;
  datasetName: string;
  hyperparameters: Hyperparameters;
  accuracy: number;
}
```

---

## 🔧 API Client

### Create an API service layer

```typescript
// api.ts
const BASE_URL = 'http://localhost:8000';

export const api = {
  // Health
  async healthCheck(): Promise<{message: string}> {
    const res = await fetch(`${BASE_URL}/`);
    if (!res.ok) throw new Error('Backend unavailable');
    return res.json();
  },

  // Datasets
  async listDatasets(): Promise<ListDatasetsResponse> {
    const res = await fetch(`${BASE_URL}/list-datasets`);
    if (!res.ok) throw new Error('Failed to fetch datasets');
    return res.json();
  },

  async previewDataset(
    name: string,
    previewSize: number = 10
  ): Promise<DatasetPreviewResponse> {
    const res = await fetch(
      `${BASE_URL}/dataset-preview/${name}?preview_size=${previewSize}`
    );
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to preview dataset');
    }
    return res.json();
  },

  async uploadDataset(
    file: File,
    name: string
  ): Promise<UploadDatasetResponse> {
    const formData = new FormData();
    formData.append('dataset', file);
    formData.append('name', name);

    const res = await fetch(`${BASE_URL}/upload-dataset`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Failed to upload dataset');
    }
    return res.json();
  },

  // Training
  async train(request: TrainRequest): Promise<TrainResponse> {
    const res = await fetch(`${BASE_URL}/train`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(request),
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.detail || 'Training failed');
    }
    return res.json();
  },
};
```

---

## 🎛️ Hyperparameter Form Logic

### Dynamic Form Component

```typescript
interface HyperparameterFormProps {
  modelName: ModelName;
  values: Hyperparameters;
  onChange: (params: Hyperparameters) => void;
}

const HyperparameterForm: React.FC<HyperparameterFormProps> = ({
  modelName,
  values,
  onChange,
}) => {
  switch (modelName) {
    case 'logistic_regression':
      return (
        <>
          <NumberInput
            label="C (Regularization)"
            value={values.C}
            onChange={(C) => onChange({...values, C})}
            min={0.001}
            step={0.1}
          />
          <NumberInput
            label="Max Iterations"
            value={values.max_iter}
            onChange={(max_iter) => onChange({...values, max_iter})}
            min={1}
            step={10}
          />
        </>
      );

    case 'svm':
      return (
        <>
          <NumberInput
            label="C (Regularization)"
            value={values.C}
            onChange={(C) => onChange({...values, C})}
            min={0.001}
            step={0.1}
          />
          <Select
            label="Kernel"
            value={values.kernel}
            onChange={(kernel) => onChange({...values, kernel})}
            options={['linear', 'poly', 'rbf', 'sigmoid']}
          />
        </>
      );

    case 'knn':
      return (
        <>
          <NumberInput
            label="Number of Neighbors"
            value={values.n_neighbors}
            onChange={(n_neighbors) => onChange({...values, n_neighbors})}
            min={1}
            step={1}
          />
          <Select
            label="Weights"
            value={values.whieghts}  // Note: backend typo
            onChange={(whieghts) => onChange({...values, whieghts})}
            options={['uniform', 'distance']}
          />
        </>
      );

    case 'decision_tree':
      return (
        <>
          <NumberInput
            label="Max Depth"
            value={values.max_depth ?? ''}
            onChange={(max_depth) => onChange({
              ...values,
              max_depth: max_depth === '' ? null : max_depth
            })}
            min={1}
            step={1}
            placeholder="Unlimited"
          />
          <Select
            label="Criterion"
            value={values.criterion}
            onChange={(criterion) => onChange({...values, criterion})}
            options={['gini', 'entropy', 'log_loss']}
          />
        </>
      );
  }
};
```

---

## 🎨 UI/UX Recommendations

### Loading States

```typescript
// During training
<button disabled={isTraining}>
  {isTraining ? (
    <>
      <Spinner /> Training...
    </>
  ) : (
    'Train Model'
  )}
</button>
```

### Error Display

```typescript
// User-friendly error messages
const getErrorMessage = (error: Error): string => {
  const msg = error.message;

  if (msg.includes('target')) {
    return 'Your CSV must have a "target" column.';
  }
  if (msg.includes('2 distinct classes')) {
    return 'The target column needs at least 2 different values.';
  }
  if (msg.includes('missing values')) {
    return 'Please remove rows with missing data.';
  }
  if (msg.includes('not found')) {
    return 'Dataset not found. Please check the name.';
  }

  return 'Something went wrong. Please try again.';
};
```

### Dataset Preview Table

```typescript
<table>
  <thead>
    <tr>
      {Object.keys(preview.samples[0]).map(col => (
        <th key={col}>{col}</th>
      ))}
    </tr>
  </thead>
  <tbody>
    {preview.samples.map((row, i) => (
      <tr key={i}>
        {Object.values(row).map((val, j) => (
          <td key={j}>{val}</td>
        ))}
      </tr>
    ))}
  </tbody>
</table>
```

### Results Display

```typescript
<div className="result">
  <h3>Training Complete</h3>
  <div className="accuracy">
    <span className="value">
      {(result.accuracy * 100).toFixed(2)}%
    </span>
    <span className="label">Accuracy</span>
  </div>
  <div className="config">
    <p>Model: {modelName}</p>
    <p>Dataset: {datasetName}</p>
    <p>Hyperparameters: {JSON.stringify(hyperparameters)}</p>
  </div>
</div>
```

---

## 🔄 Data Flow Example

### Complete Training Flow

```typescript
const handleTrain = async () => {
  try {
    // 1. Set loading state
    setIsTraining(true);
    setError(null);

    // 2. Prepare request
    const request: TrainRequest = {
      model_name: selectedModel,
      dataset_name: selectedDataset!,
      hyperparameters,
    };

    // 3. Call API
    const result = await api.train(request);

    // 4. Update state
    setCurrentResult(result);

    // 5. Add to history
    addToHistory({
      id: uuidv4(),
      timestamp: new Date(),
      modelName: selectedModel,
      datasetName: selectedDataset!,
      hyperparameters,
      accuracy: result.accuracy,
    });

    // 6. Show success
    toast.success(`Training complete! Accuracy: ${(result.accuracy * 100).toFixed(2)}%`);

  } catch (error) {
    // 7. Handle error
    setError(getErrorMessage(error as Error));
    toast.error('Training failed');
  } finally {
    // 8. Clear loading state
    setIsTraining(false);
  }
};
```

---

## 📋 Default Hyperparameters

Suggested defaults for initial form values:

```typescript
const DEFAULT_HYPERPARAMETERS: Record<ModelName, Hyperparameters> = {
  logistic_regression: {
    C: 1.0,
    max_iter: 100,
  },
  svm: {
    C: 1.0,
    kernel: 'rbf',
  },
  knn: {
    n_neighbors: 5,
    whieghts: 'uniform',
  },
  decision_tree: {
    max_depth: null,
    criterion: 'gini',
  },
};
```

---

## 🧪 Testing Strategy

### Component Tests

```typescript
// DatasetSelector.test.tsx
it('calls previewDataset when dataset is selected', async () => {
  const mockPreview = jest.fn();
  render(<DatasetSelector onPreview={mockPreview} />);

  fireEvent.change(screen.getByRole('combobox'), {
    target: {value: 'iris'},
  });

  await waitFor(() => {
    expect(mockPreview).toHaveBeenCalledWith('iris');
  });
});
```

### API Tests

```typescript
// api.test.ts
it('formats train request correctly', async () => {
  const fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue({
    ok: true,
    json: async () => ({accuracy: 0.95}),
  } as Response);

  await api.train({
    model_name: 'svm',
    dataset_name: 'iris',
    hyperparameters: {C: 1.0, kernel: 'rbf'},
  });

  expect(fetchMock).toHaveBeenCalledWith(
    'http://localhost:8000/train',
    expect.objectContaining({
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        model_name: 'svm',
        dataset_name: 'iris',
        hyperparameters: {C: 1.0, kernel: 'rbf'},
      }),
    })
  );
});
```

---

## 🎯 MVP Feature Checklist

### Phase 1: Core Functionality
- [ ] Dataset list fetching
- [ ] Dataset preview display
- [ ] Model selector (4 models)
- [ ] Dynamic hyperparameter form
- [ ] Train button + loading state
- [ ] Accuracy result display

### Phase 2: Upload
- [ ] CSV upload form
- [ ] File validation
- [ ] Upload success/error handling
- [ ] Auto-refresh dataset list

### Phase 3: History
- [ ] Store training history (localStorage)
- [ ] Display past trainings
- [ ] Compare results (table view)

### Phase 4: Polish
- [ ] Error boundary
- [ ] Loading skeletons
- [ ] Responsive design
- [ ] Keyboard navigation
- [ ] Accessibility (ARIA labels)

---

## 🚫 What NOT to Build (Backend Doesn't Support)

- ❌ Prediction interface (no /predict endpoint)
- ❌ Model saving/loading UI (models not persisted)
- ❌ Confusion matrix (only accuracy returned)
- ❌ Feature importance visualization
- ❌ Cross-validation options
- ❌ Custom train/test split ratio
- ❌ Data preprocessing controls
- ❌ Model comparison charts (can compare in table only)

---

## 🔗 Resources

- **Backend API Docs:** `BACKEND_API_REFERENCE.md`
- **Quick Reference:** `BACKEND_QUICK_REFERENCE.md`
- **Auto-generated Docs:** http://localhost:8000/docs (when backend running)

---

**Version:** 1.0
**Last Updated:** 2025-11-11
