from pydantic import BaseModel
from typing import Optional, Literal, Union, Annotated
from pydantic import Field

# Defining Model Parameters
class LogisticRegressionParams(BaseModel):
    """Hyperparameters for Logistic Regression."""
    C: float
    max_iter: int

class SVMParams(BaseModel):
    """Hyperparameters for Support Vector Machine."""
    C: float
    kernel: Literal["linear", "poly", "rbf", "sigmoid"]

class KNNParams(BaseModel):
    """Hyperparameters for K-Nearest Neighbors."""
    n_neighbors: int
    whieghts: Literal["uniform", "distance"] = "uniform"

class DecisionTreeParams(BaseModel):
    """Hyperparameters for Decision Tree."""
    max_depth: Optional[int] = None
    criterion: Literal["gini", "entropy", "log_loss"] = "gini"

class BaseTrainRequest(BaseModel):
    """Base class for model training requests."""
    dataset_name: str

# Defining Model Requests
class LogisticRegressionRequest(BaseTrainRequest):
    """Logistic Regression training request"""
    model_name: Literal["logistic_regression"]
    hyperparameters: LogisticRegressionParams

class SVMRequest(BaseTrainRequest):
    """SVM training request"""
    model_name: Literal["svm"]
    hyperparameters: SVMParams

class KNNRequest(BaseTrainRequest):
    """KNN training request"""
    model_name: Literal["knn"]
    hyperparameters: KNNParams

class DecisionTreeRequest(BaseTrainRequest):
    """Decision Tree training request"""
    model_name: Literal["decision_tree"]
    hyperparameters: DecisionTreeParams

# Supported training request for any one model. Union uses model_name as discriminator field
TrainRequest = Annotated [
    Union[LogisticRegressionRequest, SVMRequest, KNNRequest, DecisionTreeRequest], 
    Field(description= "Training request supporting one of the available models")
    ]