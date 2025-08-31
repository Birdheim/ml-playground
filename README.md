# ML Playground 🤖

**ML Playground** is an interactive web application that allows users to upload datasets, preview their contents, and train machine learning models through a simple user interface.

After spending a lot of time learning the theory behind machine learning, I wanted to actually try it out and see how it works in practice. I started building this project to get a better understanding of the core concepts by working with real data and models. While doing that, I figured it might also be helpful for others who are curious about how machine learning works and want a simple and interactive way to explore it.

## Overview
This project includes a backend service built with FastAPI and a client-side interface developed with React. The backend supports uploading CSV files as datasets, sampling and previewing dataset contents, and training a selection of scikit-learn classifiers. Users can view the number of features, samples, and classes, and experiment with different hyperparameters to see how they affect model performance, all through a clean and interactive web interface.


The first version of the project focuses exclusively on classification problems, supporting models like Logistic Regression, K-Nearest Neighbors, Decision Trees, and Support Vector Machines. Additionally, users can explore classic datasets such as Iris, Wine, and Breast Cancer. 

Future versions will expand the scope to include regression methods and neural networks, with a continued focus on providing a pedagogical and interactive learning experience for users at all levels


## Frontend Design

The user interface has been designed using Figma. While the full design is still a work in progress, the current concept and layout can be viewed here: [ML Playground Figma](https://www.figma.com/design/jSerW6czCZFYFZU2v00mJL/ML-Playground?node-id=0-1&m=dev&t=HGScV5Tx0Pyeb5dU-1)

## Technology Stack

The web application is built using a modular tech stack:
- **Backend**: Powered by FastAPI, which provides a fast and asynchronous Python API for handling dataset uploads, model training, and other machine learning operations.
- **Frontend**: Built with React, offering a responsive and interactive user interface for uploading datasets, previewing data, and training models
- **Architecture**: The project follows a split client-server architecture, keeping the frontend (React) and backend (FastAPI) codebases separate. This separation allows independent development and deployment of each component, promoting clean structure and scalability.

## Project Structure
```
ml-playground/
├── ml-backend/        # FastAPI backend
│   ├── main.py
│   ├── routes/
│   ├── services/
│   ├── schemas/
│   └── requirements.txt
│
├── client/            # React frontend
│   ├── src/
│   ├── package.json
│   └── ...            # Not started
```

## Backend Setup (FastAPI)

### Location: **backend/**

**1. Create & activate virtual environment**

```bash
cd ml-backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
```

**2. Install dependencies**

```bash
pip install -r requirements.txt
```

**3. Run the backend server**

```bash
uvicorn main:app --reload
```

Backend will be available at: [http://localhost:8000](http://localhost:8000/)

## Frontend Setup (React)
<span style="color:red">Frontend not started</span>

### Location: **client/**

**1. Install Node.js (if not already installed)**

Install from [https://nodejs.org/](https://nodejs.org/)

**2. Install dependencies**

```bash
cd client
npm install
```

**3. Start the development server**

```bash
npm run dev  # or npm start depending on your setup
```

Frontend will be available at: [http://localhost:#](http://localhost:#)

<br>
<br>

Made with love and interest,  
**Herman Bergheim ❤️**