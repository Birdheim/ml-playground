from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.train_api import router as train_router
from routes.dataset_api import router as upload_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins = ["*"],
    allow_credentials = True,
    allow_methods = ["*"],
    allow_headers = ["*"],
)

app.include_router(train_router)
app.include_router(upload_router)

@app.get("/")
def read_root():
    return {"message": "backend is up and running"}