from pydantic import BaseModel, Field

class TrainRequest(BaseModel):
    """
    A request to train one model on one dataset.

    Hyperparameters are deliberately a free-form dict rather than a per-model
    schema: the model catalogue in services/model_catalog.py is the single
    source of truth for what each model accepts, and validates them. That way
    adding a model is one entry in one file instead of a new schema class here,
    a new branch in the trainer, and matching types in the frontend.
    """
    model_name: str = Field(description="Key of the model to train, e.g. 'knn'")
    dataset_name: str = Field(description="Builtin dataset name or uploaded dataset filename")
    hyperparameters: dict = Field(default_factory=dict, description="Model-specific settings; missing values fall back to defaults")


class DecisionSurfaceRequest(TrainRequest):
    """
    A request to draw what a model decides across two columns of a dataset.

    Same shape as a training request plus the two axes. Both columns are
    optional: leaving them out lets the backend pick the two that carry the most
    information, so the picture appears before anyone has to make a choice.
    """
    x_column: str | None = Field(default=None, description="Column for the horizontal axis; chosen automatically when omitted")
    y_column: str | None = Field(default=None, description="Column for the vertical axis; chosen automatically when omitted")
