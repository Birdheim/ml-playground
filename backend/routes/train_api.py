from fastapi import APIRouter, HTTPException
from schemas.train_schema import TrainRequest
from services.model_trainer import train_model

router = APIRouter()

@router.post("/train")
def train(request: TrainRequest):
    # TODO: update return descript based on train_model
    """
    Train a classification model using the specified configurations

    Request Body:
        model_name: Name of the model (e.g. 'svm' or 'logistic_regression')
        hyperparameters: Dictionary of model-specific parameters
        dataset_name: Name of dataset (builtin or uploaded)

    Returns:
        200 OK: JSON object with training accuracy
        400 Bad Request: If the request is invalid
        500 Internal Server Error: For unexpected failures
    """

    try:
        model_name = request.model_name
        params = request.hyperparameters.model_dump()
        dataset_name = request.dataset_name

        result = train_model(model_name, params, dataset_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unexpected server error")