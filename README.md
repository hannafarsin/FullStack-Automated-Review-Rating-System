# Automatic Review Rating System

An end-to-end **Automatic Review Rating System** that predicts customer review ratings (1–5 stars) from text reviews, similar to Amazon’s review system.  

This project integrates:  
- **Django backend** (API, prediction endpoint, database)  
- **React frontend** (Amazon-like UI for reviews)  
- **BERT-based model** (deep learning for NLP classification)  
- **Kaggle dataset** for training and evaluation  


---

## Features
- Review text + summary are combined and fed into **BERT** for rating prediction.  
- **Django REST API** serves predictions.  
- **React frontend** mimics Amazon review layout with review text, rating, and date.  
- **End-to-end integration** for real-time predictions.  

---

## Tech Stack

- **Frontend:** React 
- **Backend:** Django, Django REST Framework  
- **Model:** Hugging Face Transformers (BERT)  
- **ML Libraries:** PyTorch, Scikit-learn  
- **Database:** SQLite (default, can switch to PostgreSQL/MySQL)  
 

---

## Installation
 ## 1. Clone the repository

git clone https://github.com/<hannafarsin>/<FullStack-Automated-Review-Rating-System>.git

cd <FullStack-Automated-Review-Rating-System>

## 2. Backend Setup (Django)


cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


## 3.frontend Setup (React)
cd frontend/frontend
npm install
npm start


## Model Training

- Training scripts & experiments are available in `notebooks/`  
- Pretrained model stored in `models/bert_model/` via **Git LFS**  
- Model achieved:  
  - **BiLSTM:** ~65% training accuracy, ~55% validation accuracy  
  - **BERT:** ~81% training accuracy, ~63% validation accuracy  

---

## Prediction Workflow

1. User submits a review on the frontend.  
2. Django backend calls the **BERT model** for inference.  
3. Predicted star rating (1–5) is returned and displayed in **Amazon-like review format**.  




