import os
import pandas as pd
from random import sample
from services.builtin_datasets import BUILTIN_DATASETS

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__ )))
DATASET_DIR = os.path.join(BASE_DIR, "datasets")

class DatasetRegistry:

    @staticmethod
    def save_dataset(df: pd.DataFrame, name: str):
        if not os.path.exists(DATASET_DIR):
            os.makedirs(DATASET_DIR)
        path = os.path.join(DATASET_DIR, f"{name}.csv")
        df.to_csv(path, index=False)

    @staticmethod
    def load_dataset(name: str) -> pd.DataFrame:
        path = os.path.join(DATASET_DIR, f"{name}.csv")
        if not os.path.exists(path):
            raise FileNotFoundError(f"No dataset found: {name}")
        return pd.read_csv(path)
    
    @staticmethod
    def list_datasets() -> list:
        return [f[:-4] for f in os.listdir(DATASET_DIR) if f.endswith(".csv")]
    
    @staticmethod
    def get_dataset(name: str, raw: bool = False) -> dict:
        try:
            if name in BUILTIN_DATASETS:
                data = BUILTIN_DATASETS[name]()
                if raw:
                    return data
                return {
                    "data": data.data.tolist(),
                    "target": data.target.tolist(),
                    "feature_names": data.feature_names,
                    "target_names": data.target_names,
                }
            else:
                df = DatasetRegistry.load_dataset(name)
                return {
                    "data": df.drop(columns=["target"]).values.tolist(),
                    "target": df["target"].tolist(),
                    "feature_names": [col for col in df.columns if col != "target"]
                }
        except FileNotFoundError:
            raise
        except Exception as e:
            raise ValueError(f"Failed to load dataset '{name}': {str(e)}")

    @staticmethod
    def get_dataset_preview(name: str, preview_size: int) -> dict:
        try:
            dataset = DatasetRegistry.get_dataset(name, raw=True)

            if preview_size > len(dataset["data"]):
                raise ValueError(f"Datset {name} does not have {preview_size} data entries")

            df = pd.DataFrame(dataset["data"], columns=dataset.get("feature_names"))
            df["target"] = dataset["target"]

            sample_df = df.sample(n=min(preview_size, len(df)), random_state=42)

            return {
                "n_samples": len(df),
                "n_features": df.shape[1] - 1,
                "n_classes": df["target"].nunique(),
                "samples": sample_df.to_dict(orient="records")
            }

        except FileNotFoundError:
            raise 
        except Exception as e:
            raise ValueError(f"Failed to preview dataset '{name}': {str(e)}")
