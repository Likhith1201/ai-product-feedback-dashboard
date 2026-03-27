import os
import json
import google.generativeai as genai
from dotenv import load_dotenv

# Load the API key from our .env file
load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel('gemini-2.5-flash')
def analyze_feedback(text: str):
    prompt = f"""
    You are an expert Product Manager analyzing user feedback. 
    Analyze the following text and categorize it.
    Return ONLY a valid JSON object with exact keys: "sentiment", "category", and "urgency".
    
    Rules:
    - sentiment: Positive, Neutral, or Negative
    - category: Bug, Feature Request, Pricing, Praise, or General
    - urgency: High, Medium, or Low

    Text to analyze: "{text}"
    """
    
    try:
        response = model.generate_content(
            prompt,
            generation_config={"response_mime_type": "application/json"}
        )
        
        # Clean up the response just in case the AI added markdown backticks
        clean_text = response.text.strip()
        if clean_text.startswith("```json"):
            clean_text = clean_text[7:]
        if clean_text.startswith("```"):
            clean_text = clean_text[3:]
        if clean_text.endswith("```"):
            clean_text = clean_text[:-3]
            
        return json.loads(clean_text)
        
    except Exception as e:
        print("\n--- AI ERROR DETECTED ---")
        print(e)
        print("-------------------------\n")
        return {"sentiment": "Neutral", "category": "General", "urgency": "Low"}