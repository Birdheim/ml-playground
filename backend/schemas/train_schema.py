from pydantic import BaseModel
from typing import Optional, Literal, Union

# Defining Model Parameters
class LogisticRegressionParams(BaseModel):
    C: float
    max_iter: int

class SVMParams(BaseModel):
    C: float
    kernel: Literal["linear", "poly", "rbf", "sigmoid"]

class KNNParams(BaseModel):
    n_neighbors: int
    whieghts: Literal["uniform", "distance"] = "uniform"

class DecisionTreeParams(BaseModel):
    max_depth: Optional[int] = None
    criterion: Literal["gini", "entropy", "log_loss"] = "gini"

# Defining Model Requests
class LogisticRegressionRequest(BaseModel):
    model_name: Literal["logistic_regression"]
    hyperparameters: LogisticRegressionParams

class SVMRequest(BaseModel):
    model_name: Literal["svm"]
    hyperparameters: SVMParams

class KNNRequest(BaseModel):
    model_name: Literal["knn"]
    hyperparameters: KNNParams

class DecisionTreeRequest(BaseModel):
    model_name: Literal["decision_tree"]
    hyperparameters: DecisionTreeParams

# Supported training request for any one model. Union uses model_name as discriminator field
TrainRequest = Union[LogisticRegressionRequest, SVMRequest, KNNRequest, DecisionTreeRequest]