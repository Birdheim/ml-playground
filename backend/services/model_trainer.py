from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from services.dataset_registry import DatasetRegistry
from services.builtin_datasets import BUILTIN_DATASETS

# ...
def train_model(model_name: str, hyperparameters: dict, dataset_name: str = "wine"):
    # TODO: define what the fucntion should return. Should it return only the accuracy or also the the trained model 
    '''
    Trains a classifiaction model on a specified dataset.

    Args:
        model_name (str): The key for the classifier to use
        hyperparameters (dict): Parameters passed to the classifier
        dataset_name (str): Name of the builtin dataset or the filename of an uploaded dataset
    Returns:
        Accuracy
    Raises:
        ValueError: If the dataset or model name is unsupported or the hyperparameters are invalid
    '''

    valid_models = {
        "logistic_regression": LogisticRegression,
        "svm": SVC,
        "knn": KNeighborsClassifier,
        "decision_tree":DecisionTreeClassifier
    }

    other_datasets = DatasetRegistry.list_datasets()
    
    if dataset_name not in BUILTIN_DATASETS and dataset_name not in other_datasets:
        raise ValueError(f"Unsupported dataset: {dataset_name}")
    else:
        dataset = DatasetRegistry.get_dataset(dataset_name)  # raw=False by default
        X = dataset["data"]
        y = dataset["target"]
    
    try:
        model = valid_models[model_name](**hyperparameters)
    except TypeError as e:
        raise ValueError(f"Invalid hyperparameters for {model_name}: {e}")

    # TODO: add option to edit random_state
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)
    return {
        "accuracy": accuracy
    }