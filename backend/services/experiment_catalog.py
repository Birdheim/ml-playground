"""
The questions the playground can answer.

An experiment is one question a person might actually wonder about, wrapped
around a dataset. This is deliberately not a list of datasets or of ML
categories: "Regression" means nothing to someone who has never studied this,
whereas "How much is this house worth?" means something immediately.

This is where new capabilities go. Adding regression or neural networks means
adding entries here with available=True; until then they sit in the gallery
locked, so a visitor can see what is coming rather than wondering whether the
site does anything else.

Fields:
    question      - the headline, phrased as something a person would ask
    teaser        - one sentence of context for the gallery card
    dataset       - key into the builtin datasets or an uploaded dataset name
    row_label     - what one row *is*, so the UI can say "30 passengers"
                    instead of "30 samples"
    class_names   - names for the answers, in target order. Overrides whatever
                    the dataset itself reports.
    value_labels  - optional per-column display values, so a preview table can
                    show "female" and "3rd" instead of 1 and 3
    column_labels - optional friendlier column headings
    available     - False renders the card locked
    eve_says      - what Eve says about a locked experiment
"""

EXPERIMENTS = {
    "titanic": {
        "question": "Who survived the Titanic?",
        "teaser": "714 real passengers, and what we know about each of them. Can a computer work out who made it off the ship?",
        "dataset": "titanic",
        "row_label": "passenger",
        "class_names": ["Did not survive", "Survived"],
        "column_labels": {
            "passenger_class": "Ticket class",
            "is_female": "Sex",
            "age": "Age",
            # spaces matter here: these become table headings in a narrow
            # column, and a slash gives the browser nowhere to wrap
            "siblings_spouses_aboard": "Siblings or spouse",
            "parents_children_aboard": "Parents or children",
            "ticket_fare": "Fare paid",
        },
        "value_labels": {
            "is_female": {"0": "male", "1": "female"},
            "passenger_class": {"1": "1st", "2": "2nd", "3": "3rd"},
        },
        "available": True,
    },
    "iris": {
        "question": "What kind of flower is this?",
        "teaser": "Three species of iris that look alike to most of us. All the computer gets is four measurements of the petals and leaves.",
        "dataset": "iris",
        "row_label": "flower",
        "class_names": ["Setosa", "Versicolor", "Virginica"],
        "available": True,
    },
    "wine": {
        "question": "Which vineyard made this wine?",
        "teaser": "178 bottles from three different growers, described only by what a chemistry lab measured in them.",
        "dataset": "wine",
        "row_label": "bottle",
        "class_names": ["Grower A", "Grower B", "Grower C"],
        "available": True,
    },
    "breast_cancer": {
        "question": "Is this tumour harmless?",
        "teaser": "Measurements taken from real tissue samples. This is the kind of question where being wrong actually matters — a good place to look closely at the mistakes.",
        "dataset": "breast_cancer",
        "row_label": "sample",
        "class_names": ["Harmful", "Harmless"],
        "available": True,
    },
    "house_prices": {
        "question": "How much is this house worth?",
        "teaser": "Predicting a number rather than picking a group. Different kind of problem, different kind of model.",
        "dataset": None,
        "row_label": "house",
        "available": False,
        "eve_says": "I can sort things into groups, but I have not learned to predict numbers yet. That is called regression, and it is next on my list.",
    },
    "handwriting": {
        "question": "Can it learn to read handwriting?",
        "teaser": "Thousands of hand-drawn digits. This one needs a neural network, which works rather differently to everything else here.",
        "dataset": None,
        "row_label": "digit",
        "available": False,
        "eve_says": "This one needs a neural network. I am still working out how those fit together — come back and ask me again soon.",
    },
}


def list_experiments() -> list:
    """The gallery listing. Safe to serialise, ordered as defined above."""
    return [
        {
            "name": name,
            "question": spec["question"],
            "teaser": spec["teaser"],
            "row_label": spec["row_label"],
            "available": spec["available"],
            "eve_says": spec.get("eve_says"),
        }
        for name, spec in EXPERIMENTS.items()
    ]


def get_experiment(name: str) -> dict:
    """
    Full detail for one experiment, including the display hints the preview
    table uses.

    Raises:
        ValueError: If the experiment is unknown or not built yet
    """
    if name not in EXPERIMENTS:
        raise ValueError(f"Unknown experiment: {name}")

    spec = EXPERIMENTS[name]
    if not spec["available"]:
        raise ValueError(f"Experiment '{name}' is not available yet")

    return {
        "name": name,
        "question": spec["question"],
        "teaser": spec["teaser"],
        "dataset": spec["dataset"],
        "row_label": spec["row_label"],
        "class_names": spec.get("class_names"),
        "column_labels": spec.get("column_labels", {}),
        "value_labels": spec.get("value_labels", {}),
        "available": True,
    }


def class_names_for_dataset(dataset_name: str):
    """
    Nicer answer names for a dataset, if an experiment defines them.

    Uploaded datasets carry no names for their classes, and the builtin ones
    use labels like 'class_0'. Returns None when there is nothing better to
    offer, so the caller can fall back.
    """
    for spec in EXPERIMENTS.values():
        if spec.get("dataset") == dataset_name and spec.get("class_names"):
            return spec["class_names"]
    return None
