from fastapi import APIRouter, UploadFile, Query, File, Form, HTTPException
import pandas as pd
from random import sample
from services.dataset_registry import DatasetRegistry
from services.builtin_datasets import BUILTIN_DATASETS

router = APIRouter()

@router.get("/list-datasets")
def list_datasets():
    """
    Returns:
        200 OK: JSON object listing the builtin and uploaded datasets available
    """
    builtin = [key for key in BUILTIN_DATASETS.keys()]
    uploaded = DatasetRegistry.list_datasets()
    return {"datasets": builtin + uploaded}

@router.get("/dataset-preview/{name}")
def preview_dataset(
    name: str, 
    preview_size: int = Query(..., gt=0, description="Number of samples to preview")
    ):
    """
    Returns:
        200 OK: JSON object with the specified amount of data liens
        404 Not found: Given dataset not found
        400 Bad request: Invalid request
    """
    try:
        return DatasetRegistry.get_dataset_preview(name, preview_size)
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail=f"Dataset '{name}' not found")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/upload-dataset")
async def upload_dataset(dataset: UploadFile = File(...), name: str = Form(...)):
    """
    Returns:
        200 OK: Dataset uploaded, and returns JSON with dataset metrics
        400 Bad request: If dataset doesnt follow the required format
        500 Internal Server Error: If dataset cannot be processed
    """

    try:
        #Read and parse the uploaded CSV
        df = pd.read_csv(dataset.file)
        
        # Check for presence of "target" column
        if "target" not in df.columns:
            raise HTTPException(status_code=400, detail="Dataset must include 'target' column.")
        
        # Ensures at least two target classes
        if df["target"].nunique() < 2:
            raise HTTPException(status_code=400, detail="Target must have at least 2 distinct classes.")

        # Ensure at least one feature column 
        if df.shape[1] < 2:
            raise HTTPException(status_code=400, detail="Dataset must include at least one feature column.")
        
        # Check for missing values in features
        if df.drop(columns=["target"]).isnull().any().any():
            raise HTTPException(status_code=400, detail="Feature data contains missing values.")

        # Check for missing values in target
        if df["target"].isnull().any():
            raise HTTPException(status_code=400, detail="Target column contains missing values.")

        DatasetRegistry.save_dataset(df, name)

        return {
            "message": f"Dataset '{name}' uploaded successfully", 
            "rows": df.shape[0],
            "features": df.shape[1]-1
            }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process dataset: {str(e)}")