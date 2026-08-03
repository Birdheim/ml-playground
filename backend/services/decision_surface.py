"""
The picture of what a model actually decided.

A score tells you how well a model did. It does not tell you *how it thinks* —
why K-Nearest Neighbours carves the data into islands while Logistic Regression
can only cut it with a straight line. That difference is the whole point of
having more than one model, and it is invisible in any number.

So: pick two columns, fit the model on just those two, and predict across a grid
covering the whole plane. The frontend paints the grid as coloured regions and
draws the real data on top. Where a point sits on the wrong colour, the model got
it wrong, and you can see why.

The two-column restriction is real and has to be admitted in the UI: a model that
can only see two of the six things we know about a passenger is a worse model
than the one in the main result, and it will score lower. It is a diagram of the
method, not a re-run of the experiment.
"""

import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.tree import DecisionTreeClassifier

from services.builtin_datasets import BUILTIN_DATASETS
from services.dataset_registry import DatasetRegistry
from services.experiment_catalog import class_names_for_dataset
from services.model_catalog import MODELS, validate_hyperparameters

# The grid is drawn without smoothing, because a decision tree's boundary really
# is a hard-edged staircase and blurring it would hide the one thing that makes
# a tree look different from everything else. That means the resolution has to
# carry the crispness: 120x120 is 14,400 predictions, still comfortably fast for
# every model here, and fine enough that the steps read as steps rather than as
# blocks.
GRID = 120

# Enough points to show the shape of the data, few enough to stay readable and
# to keep the payload small. Sampled evenly, never the first N, which on a
# sorted dataset would be one class only.
MAX_POINTS = 400

# The plane is padded past the data so the boundary has somewhere to run to,
# rather than stopping flush against the outermost point.
PAD = 0.05

# Where to cut the view, for a column with a long tail. Titanic is the case that
# forces this: a handful of passengers paid over £500 while the median paid £16,
# so scaling to the true maximum pushed nine tenths of the data into the bottom
# sixth of the picture and left the rest blank.
#
# The rule is Tukey's fence (the one a box plot uses for its whiskers), held
# back so it can never cut away more than the outermost 5% — on fare the fence
# alone would pin 13% of passengers to the rim, which trades one misleading
# picture for another. Measured on this dataset: fare ends up cut at £120 with
# 4.8% against the edge and the median a quarter of the way up, age at 65 with
# 1.5% against the edge. On iris and wine neither rule bites and the view is the
# full range.
#
# Only the camera moves — the model still trains on every row.
IQR_FENCE = 1.5
KEEP_PCT = 5.0


def _as_list(value) -> list:
    return value.tolist() if hasattr(value, "tolist") else list(value)


def _bounds(values) -> tuple:
    """
    Where to put the edges of the picture for one column.

    Percentiles rather than min and max, so one extreme value cannot flatten
    everything else against a wall. Falls back to the true range for a column
    too narrow for percentiles to separate, and finally to an arbitrary width
    for a column that is entirely one value.
    """
    q1, q3 = np.percentile(values, [25, 75])
    fence = (q3 - q1) * IQR_FENCE

    # whichever of the two rules keeps more of the data, then never past the
    # data's own ends — the view is allowed to be tighter than the range, never
    # wider and emptier
    low = max(float(values.min()), min(q1 - fence, float(np.percentile(values, KEEP_PCT))))
    high = min(float(values.max()), max(q3 + fence, float(np.percentile(values, 100 - KEEP_PCT))))

    if high <= low:
        low, high = float(values.min()), float(values.max())
    if high <= low:
        low, high = low - 0.5, high + 0.5

    pad = (high - low) * PAD
    low, high = low - pad, high + pad

    # Padding below zero on a column that is never negative labels the axis
    # "-2.8" under the heading "Age", which reads as a bug rather than as
    # breathing room.
    if float(values.min()) >= 0:
        low = max(low, 0.0)

    return low, high


def _most_informative(X, y, feature_names) -> tuple:
    """
    The two columns worth drawing, chosen rather than asked for.

    Making a newcomer pick two axes before they have seen anything is the same
    mistake as making them pick a model before they have seen a result. A quick
    tree ranks the columns by how much work each one does, and the picker starts
    on the best two — changeable, but never blocking.
    """
    ranker = DecisionTreeClassifier(random_state=42)
    ranker.fit(X, y)
    ranked = np.argsort(ranker.feature_importances_)[::-1]
    return int(ranked[0]), int(ranked[1])


def decision_surface(
    model_name: str,
    hyperparameters: dict,
    dataset_name: str,
    x_column: str = None,
    y_column: str = None,
):
    """
    Fits one model on two columns and maps what it predicts across the plane.

    Args:
        model_name (str): Key into the model catalogue
        hyperparameters (dict): Settings for that model, validated as usual
        dataset_name (str): Builtin dataset name or uploaded dataset filename
        x_column (str): Column for the horizontal axis; chosen automatically
                        when omitted
        y_column (str): Column for the vertical axis; likewise
    Returns:
        The two columns used, the plane they span, a GRID x GRID array of
        predicted class ids with row 0 at the top (y_max) so it maps straight
        onto a canvas, the data points to draw over it, and the accuracy this
        two-column model manages — which is lower than the full model's, and is
        returned so the UI can say so rather than imply otherwise.
    Raises:
        ValueError: If the dataset, model, columns or hyperparameters are invalid
    """

    if dataset_name not in BUILTIN_DATASETS and dataset_name not in DatasetRegistry.list_datasets():
        raise ValueError(f"Unsupported dataset: {dataset_name}")

    dataset = DatasetRegistry.get_dataset(dataset_name)
    X = np.asarray(dataset["data"], dtype=float)
    y = np.asarray(dataset["target"])
    feature_names = _as_list(dataset.get("feature_names") or [])

    if X.shape[1] < 2:
        raise ValueError("This dataset has too few columns to draw a plane")

    if x_column is None or y_column is None:
        xi, yi = _most_informative(X, y, feature_names)
    else:
        for column in (x_column, y_column):
            if column not in feature_names:
                raise ValueError(f"Unknown column: {column}")
        xi = feature_names.index(x_column)
        yi = feature_names.index(y_column)

    if xi == yi:
        raise ValueError("Pick two different columns — a plane needs two axes")

    catalog_names = class_names_for_dataset(dataset_name)
    if catalog_names:
        class_names = list(catalog_names)
    elif dataset.get("target_names") is not None:
        class_names = [str(name) for name in _as_list(dataset["target_names"])]
    else:
        class_names = [str(label) for label in sorted(set(_as_list(y)))]

    params = validate_hyperparameters(model_name, hyperparameters)

    # The same split as the main experiment, so the picture is of a model that
    # was held to the same test rather than one that got to see everything.
    pair = X[:, [xi, yi]]
    pair_train, pair_test, y_train, y_test = train_test_split(
        pair, y, test_size=0.2, random_state=42
    )

    try:
        model = MODELS[model_name]["estimator"](**params)
        model.fit(pair_train, y_train)
    except (TypeError, ValueError) as e:
        raise ValueError(f"Could not train {model_name}: {e}")

    x_min, x_max = _bounds(pair[:, 0])
    y_min, y_max = _bounds(pair[:, 1])

    # Rows run top-down (y_max first) to match how a canvas is addressed, so
    # the frontend can blit the array straight out without flipping it.
    xs = np.linspace(x_min, x_max, GRID)
    ys = np.linspace(y_max, y_min, GRID)
    mesh_x, mesh_y = np.meshgrid(xs, ys)
    grid = model.predict(np.c_[mesh_x.ravel(), mesh_y.ravel()]).reshape(GRID, GRID)

    # Even stride rather than the first MAX_POINTS: several of these datasets
    # are stored sorted by class, so a head slice would be one colour. Round the
    # stride up, or a set half again as big as the cap would slip through whole.
    step = max(1, -(-len(pair) // MAX_POINTS))
    shown = pair[::step]
    labels = y[::step]

    # Anything outside the view is pinned to the edge rather than dropped. A
    # missing point is a lie about how much data there is; a point on the rim
    # reads as "at least this far out", which is true.
    clipped_x = np.clip(shown[:, 0], x_min, x_max)
    clipped_y = np.clip(shown[:, 1], y_min, y_max)
    n_clipped = int((clipped_x != shown[:, 0]).sum() + (clipped_y != shown[:, 1]).sum())

    points = [
        {"x": float(px), "y": float(py), "c": int(label)}
        for px, py, label in zip(clipped_x, clipped_y, labels)
    ]

    n_correct = int((model.predict(pair_test) == y_test).sum())

    return {
        "x_column": feature_names[xi],
        "y_column": feature_names[yi],
        "columns": feature_names,
        "x_min": x_min,
        "x_max": x_max,
        "y_min": y_min,
        "y_max": y_max,
        "resolution": GRID,
        "grid": grid.astype(int).tolist(),
        "points": points,
        "n_clipped": n_clipped,
        "class_names": class_names,
        "n_correct": n_correct,
        "n_test": int(len(y_test)),
    }
