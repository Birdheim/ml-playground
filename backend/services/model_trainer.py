from sklearn.model_selection import train_test_split
from services.dataset_registry import DatasetRegistry
from services.builtin_datasets import BUILTIN_DATASETS
from services.model_catalog import MODELS, validate_hyperparameters
from services.experiment_catalog import class_names_for_dataset

# How many misclassified rows to hand back. Enough to look at, few enough to read.
MAX_MISTAKES = 5


def _as_list(value) -> list:
    """sklearn hands back numpy arrays in some places and plain lists in others."""
    return value.tolist() if hasattr(value, "tolist") else list(value)


def train_model(model_name: str, hyperparameters: dict, dataset_name: str = "wine"):
    '''
    Trains a classification model on a specified dataset.

    Args:
        model_name (str): The key for the classifier to use
        hyperparameters (dict): Parameters passed to the classifier
        dataset_name (str): Name of the builtin dataset or the filename of an uploaded dataset
    Returns:
        A summary of how the model did, in counts rather than just a score:
        how many test examples it got right, and the individual rows it got
        wrong, so the frontend can show them instead of only reporting accuracy.
    Raises:
        ValueError: If the dataset or model name is unsupported or the hyperparameters are invalid
    '''

    other_datasets = DatasetRegistry.list_datasets()

    if dataset_name not in BUILTIN_DATASETS and dataset_name not in other_datasets:
        raise ValueError(f"Unsupported dataset: {dataset_name}")

    dataset = DatasetRegistry.get_dataset(dataset_name)  # raw=False by default
    X = dataset["data"]
    y = dataset["target"]
    feature_names = _as_list(dataset.get("feature_names") or [])

    # Prefer the experiment's own wording ("Did not survive" beats "0"), then
    # whatever the dataset reports, then the raw label as a last resort. Cast
    # either way: numpy string types don't survive JSON.
    catalog_names = class_names_for_dataset(dataset_name)
    if catalog_names:
        class_names = list(catalog_names)
    elif dataset.get("target_names") is not None:
        class_names = [str(name) for name in _as_list(dataset["target_names"])]
    else:
        class_names = [str(label) for label in sorted(set(y))]

    params = validate_hyperparameters(model_name, hyperparameters)

    # TODO: add option to edit random_state
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    try:
        model = MODELS[model_name]["estimator"](**params)
        model.fit(X_train, y_train)
    except (TypeError, ValueError) as e:
        raise ValueError(f"Could not train {model_name}: {e}")

    predictions = _as_list(model.predict(X_test))

    def class_name(label):
        index = int(label)
        return class_names[index] if 0 <= index < len(class_names) else str(label)

    mistakes = []
    for features, predicted, actual in zip(X_test, predictions, y_test):
        if predicted == actual:
            continue
        if len(mistakes) < MAX_MISTAKES:
            mistakes.append({
                "features": dict(zip(feature_names, features)),
                "predicted": class_name(predicted),
                "actual": class_name(actual),
            })

    n_correct = sum(1 for p, a in zip(predictions, y_test) if p == a)

    return {
        "accuracy": n_correct / len(y_test),
        "n_correct": n_correct,
        "n_test": len(y_test),
        "n_train": len(y_train),
        "n_mistakes": len(y_test) - n_correct,
        "mistakes": mistakes,
        "class_names": class_names,
        "feature_names": feature_names,
    }
