from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Feedback(Base):
    __tablename__ = "feedback"

    id = Column(Integer, primary_key=True, index=True)
    raw_message = Column(Text, nullable=False)
    
    # These three columns will be filled by our AI Agent later
    sentiment = Column(String, nullable=True) 
    category = Column(String, nullable=True)  
    urgency = Column(String, nullable=True)   
    
    created_at = Column(DateTime, default=datetime.utcnow)