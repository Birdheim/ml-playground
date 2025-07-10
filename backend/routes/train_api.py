from fastapi import APIRouter, HTTPException
from schemas.train_schema import TrainRequest
from services.model_trainer import train_model

router = APIRouter()

@router.post("/train")
def train(request: TrainRequest):
    try:
        model_name = request.model_name
        params = request.hyperparameters.model_dump()
        
        result = train_model(model_name, params)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="Unexpected server error")