from fastapi import APIRouter, HTTPException
from schemas.train_schema import TrainRequest
from services.model_trainer import train_model
from services.model_catalog import list_models

router = APIRouter()

@router.get("/models")
def get_models():
    """
    Lists the available models and the hyperparameters each one accepts.

    The frontend builds its settings form from this, so a model added to the
    catalogue shows up in the UI without any frontend change.

    Returns:
        200 OK: JSON object with the model catalogue
    """
    return {"models": list_models()}


@router.post("/train")
def train(request: TrainRequest):
    """
    Train a classification model using the specified configurations

    Request Body:
        model_name: Name of the model (e.g. 'svm' or 'logistic_regression')
        hyperparameters: Dictionary of model-specific parameters
        dataset_name: Name of dataset (builtin or uploaded)

    Returns:
        200 OK: JSON object with how many test examples the model got right,
                the rows it got wrong, and the class and feature names
        400 Bad Request: If the request is invalid
        500 Internal Server Error: For unexpected failures
    """

    try:
        return train_model(
            request.model_name,
            request.hyperparameters,
            request.dataset_name,
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Unexpected server error")
