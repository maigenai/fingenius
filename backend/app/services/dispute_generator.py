from typing import Dict, Any
import json
from langchain_anthropic import ChatAnthropic
from app.core.config import settings
from app import models


def generate_dispute_letter(document: models.Document, reason: str, details: str) -> str:
    """
    Generate a dispute letter using Anthropic Claude.
    """
    # Initialize LLM
    llm = ChatAnthropic(
        model="claude-3-sonnet-20240229",
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        temperature=0.2,
    )

    # Extract relevant data
    document_data = {
        "document_type": document.document_type,
        "filename": document.filename,
        "extracted_data": document.extracted_data if document.extracted_data else {},
    }
    
    data_json = json.dumps(document_data, indent=2)

    # Create the prompt
    prompt = f"""
    You are a team of experts working together to create an effective dispute letter.
    
    First, as a Consumer Rights Legal Expert, analyze this dispute situation and provide legal guidance.
    
    Document information:
    {data_json}
    
    Dispute reason: {reason}
    
    Dispute details: {details}
    
    Consider:
    1. Relevant consumer protection laws that apply to this situation
    2. Key legal points that should be included in the dispute letter
    3. Recommended structure and approach for the dispute
    4. Any specific language or references that would strengthen the case
    
    Then, as a Professional Communication Specialist, draft a professional, persuasive dispute letter based on the legal analysis and dispute details.
    
    The letter should:
    1. Be professionally formatted with proper business letter structure
    2. Clearly state the nature of the dispute
    3. Include specific details and evidence supporting the claim
    4. Reference relevant laws or regulations when appropriate
    5. Make a clear request for resolution
    6. Set reasonable timeframes for response
    7. Be firm but respectful in tone
    
    Create a complete, ready-to-send letter that the user can print and mail or email.
    """

    # Call the LLM
    try:
        response = llm.invoke(prompt)
        
        # Clean up the result to extract just the letter
        letter_text = response.content
        
        # Try to find the start of the letter
        letter_start_indicators = [
            "---",
            "===",
            "DISPUTE LETTER",
            "COMPLAINT LETTER",
            "[Date]",
            "[Your Name]",
            "Dear ",
        ]
        
        # Try to find the start of the letter
        for indicator in letter_start_indicators:
            if indicator in response.content:
                parts = response.content.split(indicator, 1)
                if len(parts) > 1:
                    letter_text = indicator + parts[1]
                    break
        
        return letter_text
        
    except Exception as e:
        print(f"Error calling Anthropic API: {e}")
        return f"Error generating dispute letter: {str(e)}"
