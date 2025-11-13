## 🖥️ Backend Setup (FastAPI)

The backend is built with **FastAPI**, providing endpoints for dataset handling, model training, and more.

### 🔧 Requirements

- Python 3.9+  
- `venv` (for creating a virtual environment)  
- `uvicorn` (for running the FastAPI server)

### ▶️ How to Run the Backend

**1. Navigate to the backend directory:**

```bash
cd ml-backend
````

**2. Create and activate a virtual environment (only once):**
```bash
python -m venv venv
source venv/bin/activate     # macOS/Linux
# OR
venv\Scripts\activate        # Windows
````

**3. Install dependencies**
````bash
pip install -r requirements.txt
````

**4. Start the development server:**
````bash
uvicorn main:app --reload
````
\
*URLs*
- API Root: http://localhost:8000
- API Docs (Swagger UI): http://localhost:8000/docs