from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from database import engine, get_db, Base
import models
from ai_agent import analyze_feedback

# Create the tables in the database
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="AI Feedback Dashboard")

# Enable CORS for the React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# This tells FastAPI what kind of data to expect from the user
class IncomingFeedback(BaseModel):
    message: str

@app.get("/")
def health_check():
    return {"status": "success", "message": "Backend and Database are ready!"}

@app.post("/api/feedback/")
def process_feedback(feedback: IncomingFeedback, db: Session = Depends(get_db)):
    # 1. Send the raw message to our AI Agent
    ai_result = analyze_feedback(feedback.message)
    
    # 2. Save the message AND the AI's analysis to NeonDB
    new_entry = models.Feedback(
        raw_message=feedback.message,
        sentiment=ai_result.get("sentiment"),
        category=ai_result.get("category"),
        urgency=ai_result.get("urgency")
    )
    
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    
    return {"status": "success", "data": new_entry}

# This endpoint sends all our saved feedback to the React dashboard
@app.get("/api/feedback/all")
def get_all_feedback(db: Session = Depends(get_db)):
    # Fetch all feedback, newest first
    all_feedback = db.query(models.Feedback).order_by(models.Feedback.id.desc()).all()
    return {"status": "success", "data": all_feedback}