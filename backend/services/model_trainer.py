from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.datasets import load_wine

def train_model(model_name: str, hyperparameters: dict):
    valid_models = {
        "logistic_regression": LogisticRegression,
        "svm": SVC,
        "knn": KNeighborsClassifier,
        "decision_tree":DecisionTreeClassifier
    }
    
    try:
        model = valid_models[model_name](**hyperparameters)
    except TypeError as e:
        raise ValueError(f"Invalid hyperparameters for {model_name}: {e}")

    data = load_wine()
    # TODO: add option to edit random_state
    X_train, X_test, y_train, y_test = train_test_split(data.data, data.target, test_size=0.2, random_state=42)

    model.fit(X_train, y_train)
    accuracy = model.score(X_test, y_test)
    return {"accuracy": accuracy}