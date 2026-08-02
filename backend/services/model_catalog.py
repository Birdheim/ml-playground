from sklearn.linear_model import LogisticRegression
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier

"""
Single source of truth for the models the playground offers.

Each entry holds everything both sides of the app need: the estimator to fit,
and enough description for the frontend to render the hyperparameter form
without knowing anything about the model. Adding a model here makes it appear
in the UI automatically.

Parameter types:
    "int"    - whole number, rendered as a slider between min and max
    "float"  - decimal number, rendered as a slider between min and max
    "choice" - one of `options`, rendered as a dropdown
"""

MODELS = {
    "knn": {
        "label": "K-Nearest Neighbours",
        "blurb": "Looks at the most similar examples it has seen before and goes with the majority vote.",
        "estimator": KNeighborsClassifier,
        "params": [
            {
                "name": "n_neighbors",
                "label": "Neighbours to ask",
                "help": "How many similar examples get a vote. Ask only one and a single odd example can decide the answer; ask many and the model ignores small details.",
                "type": "int",
                "default": 5,
                "min": 1,
                "max": 50,
            },
            {
                "name": "weights",
                "label": "Vote weighting",
                "help": "Whether every neighbour counts equally, or closer neighbours count for more.",
                "type": "choice",
                "default": "uniform",
                "options": ["uniform", "distance"],
            },
        ],
    },
    "decision_tree": {
        "label": "Decision Tree",
        "blurb": "Plays twenty questions with the data, splitting on one measurement at a time until it can name the answer.",
        "estimator": DecisionTreeClassifier,
        "params": [
            {
                "name": "max_depth",
                "label": "Questions allowed",
                "help": "How many questions in a row the tree may ask. Very few and it cannot tell the classes apart; very many and it starts memorising instead of learning.",
                "type": "int",
                "default": 5,
                "min": 1,
                "max": 20,
            },
            {
                "name": "criterion",
                "label": "Split quality measure",
                "help": "How the tree decides which question is worth asking next.",
                "type": "choice",
                "default": "gini",
                "options": ["gini", "entropy", "log_loss"],
            },
        ],
    },
    "logistic_regression": {
        "label": "Logistic Regression",
        "blurb": "Draws straight dividing lines through the data and reports how confident it is on each side.",
        "estimator": LogisticRegression,
        "params": [
            {
                "name": "C",
                "label": "Freedom to fit",
                "help": "How closely the model is allowed to follow the training examples. Low values keep it simple, high values let it chase every point.",
                "type": "float",
                "default": 1.0,
                "min": 0.01,
                "max": 10.0,
            },
            {
                "name": "max_iter",
                "label": "Attempts allowed",
                "help": "How long the model may keep adjusting itself before it has to stop and give an answer.",
                "type": "int",
                "default": 200,
                "min": 50,
                "max": 2000,
            },
        ],
    },
    "svm": {
        "label": "Support Vector Machine",
        "blurb": "Finds the dividing line with the widest possible gap between the classes.",
        "estimator": SVC,
        "params": [
            {
                "name": "C",
                "label": "Freedom to fit",
                "help": "How much the model is punished for getting training examples wrong. Low values tolerate mistakes for a simpler boundary.",
                "type": "float",
                "default": 1.0,
                "min": 0.01,
                "max": 10.0,
            },
            {
                "name": "kernel",
                "label": "Boundary shape",
                "help": "Whether the dividing line must be straight, or may bend around the data.",
                "type": "choice",
                "default": "rbf",
                "options": ["linear", "poly", "rbf", "sigmoid"],
            },
        ],
    },
}


def list_models() -> list:
    """
    Returns the catalogue in a JSON-safe shape, without the estimator classes.
    """
    return [
        {
            "name": name,
            "label": spec["label"],
            "blurb": spec["blurb"],
            "params": spec["params"],
        }
        for name, spec in MODELS.items()
    ]


def validate_hyperparameters(model_name: str, raw: dict) -> dict:
    """
    Checks submitted hyperparameters against the catalogue.

    Missing values fall back to the parameter's default, and keys the model
    does not recognise are ignored, so the frontend can be relaxed about what
    it sends. Anything out of range or outside a choice list is rejected here
    rather than deeper down in scikit-learn, where the error message would
    mean nothing to the user.

    Args:
        model_name (str): Key into MODELS
        raw (dict): Hyperparameters as submitted
    Returns:
        Cleaned parameters, safe to pass to the estimator
    Raises:
        ValueError: If the model is unknown or a value is invalid
    """

    if model_name not in MODELS:
        raise ValueError(f"Unsupported model: {model_name}")

    raw = raw or {}
    clean = {}

    for param in MODELS[model_name]["params"]:
        value = raw.get(param["name"], param["default"])

        if param["type"] == "choice":
            if value not in param["options"]:
                raise ValueError(
                    f"'{param['name']}' must be one of {param['options']}, got '{value}'"
                )
        else:
            try:
                value = int(value) if param["type"] == "int" else float(value)
            except (TypeError, ValueError):
                raise ValueError(f"'{param['name']}' must be a number, got '{value}'")

            if not param["min"] <= value <= param["max"]:
                raise ValueError(
                    f"'{param['name']}' must be between {param['min']} and {param['max']}, got {value}"
                )

        clean[param["name"]] = value

    return clean
