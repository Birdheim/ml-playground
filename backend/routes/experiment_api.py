from fastapi import APIRouter, HTTPException
from services.experiment_catalog import list_experiments, get_experiment

router = APIRouter()

@router.get("/experiments")
def get_experiments():
    """
    Lists the questions the playground can answer.

    Includes the ones that are not built yet, flagged as unavailable, so the
    gallery can show what is coming rather than hiding it.

    Returns:
        200 OK: JSON object with the experiment listing
    """
    return {"experiments": list_experiments()}


@router.get("/experiments/{name}")
def get_experiment_detail(name: str):
    """
    Full detail for one experiment, including the display hints its preview
    table needs.

    Returns:
        200 OK: JSON object describing the experiment
        404 Not Found: Unknown experiment, or one that is not built yet
    """
    try:
        return get_experiment(name)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
