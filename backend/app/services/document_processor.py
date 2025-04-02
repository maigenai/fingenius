import os
import json
from typing import Dict, Any, Optional
import pytesseract
from PIL import Image
import pypdf
from langchain_anthropic import ChatAnthropic
from app.core.config import settings


def process_document(file_path: str, document_type: str) -> Optional[Dict[str, Any]]:
    """
    Process a document using Anthropic Claude models and extract structured data.
    """
    # Extract text from document
    text = extract_text_from_document(file_path)
    if not text:
        return None

    # Initialize LLM
    llm = ChatAnthropic(
        model="claude-3-opus-20240229",
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        temperature=0.1,
    )

    # Prepare the prompt for document analysis
    prompt = f"""
    You are an expert in financial document analysis with years of experience in banking and financial services.
    
    Analyze this {document_type} document and extract all relevant information.
    
    Document text:
    {text[:10000]}  # Limit text length to avoid token limits
    
    Focus on:
    1. Identifying the document type and issuer
    2. Finding key dates, account numbers, and financial information
    3. Extracting transaction details if present
    4. Identifying any fees, charges, or important notices
    
    Be thorough and precise in your analysis.
    
    Then, as a financial expert, provide interpretation of the data:
    1. Identify the most important financial information
    2. Highlight any unusual patterns or potential issues
    3. Provide context for the financial data
    4. Note any information that might be relevant for disputes or financial planning
    
    Finally, convert all the extracted information into a well-structured JSON format.
    
    The JSON should include:
    1. Document metadata (type, issuer, dates, account info)
    2. Financial summary data
    3. Detailed transaction list (if applicable)
    4. Important notices or action items
    
    Return ONLY the JSON object without any additional text or explanation.
    """

    # Call the LLM
    try:
        response = llm.invoke(prompt)
        
        # Parse the JSON result
        try:
            # Find JSON in the result
            json_start = response.content.find('{')
            json_end = response.content.rfind('}') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response.content[json_start:json_end]
                extracted_data = json.loads(json_str)
                return extracted_data
            else:
                # If no JSON found, try to create a basic structure
                return {
                    "document_type": document_type,
                    "raw_text": text[:5000],  # Include truncated raw text
                    "extraction_status": "partial",
                    "extraction_method": "fallback"
                }
        except json.JSONDecodeError:
            # If JSON parsing fails, return a basic structure
            return {
                "document_type": document_type,
                "raw_text": text[:5000],  # Include truncated raw text
                "extraction_status": "failed",
                "extraction_method": "fallback"
            }
    except Exception as e:
        print(f"Error calling Anthropic API: {e}")
        return {
            "document_type": document_type,
            "raw_text": text[:5000],  # Include truncated raw text
            "extraction_status": "error",
            "extraction_method": "fallback",
            "error": str(e)
        }


def extract_text_from_document(file_path: str) -> str:
    """
    Extract text from a document file (PDF, image, etc.)
    """
    file_ext = os.path.splitext(file_path)[1].lower()
    
    if file_ext == '.pdf':
        return extract_text_from_pdf(file_path)
    elif file_ext in ['.png', '.jpg', '.jpeg']:
        return extract_text_from_image(file_path)
    else:
        return ""


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Extract text from a PDF file
    """
    text = ""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = pypdf.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text


def extract_text_from_image(image_path: str) -> str:
    """
    Extract text from an image file using OCR
    """
    try:
        image = Image.open(image_path)
        text = pytesseract.image_to_string(image)
        return text
    except Exception as e:
        print(f"Error extracting text from image: {e}")
        return ""


def extract_entities(text: str) -> Dict[str, Any]:
    """
    Extract named entities from text.
    """
    # This is a placeholder. In a real implementation, this would use a more sophisticated
    # entity extraction approach, possibly using spaCy or another NLP library.
    entities = {
        "dates": [],
        "amounts": [],
        "account_numbers": [],
        "names": [],
    }
    
    # Very simple pattern matching for demonstration
    import re
    
    # Find dates (simple patterns)
    date_patterns = [
        r'\d{1,2}/\d{1,2}/\d{2,4}',  # MM/DD/YYYY or DD/MM/YYYY
        r'\d{1,2}-\d{1,2}-\d{2,4}',  # MM-DD-YYYY or DD-MM-YYYY
        r'[A-Z][a-z]{2,8} \d{1,2},? \d{4}'  # Month DD, YYYY
    ]
    
    for pattern in date_patterns:
        matches = re.findall(pattern, text)
        entities["dates"].extend(matches)
    
    # Find monetary amounts
    amount_patterns = [
        r'\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?',  # $X,XXX.XX
        r'\d{1,3}(?:,\d{3})*(?:\.\d{2})? (?:dollars|USD)'  # X,XXX.XX dollars/USD
    ]
    
    for pattern in amount_patterns:
        matches = re.findall(pattern, text)
        entities["amounts"].extend(matches)
    
    # Find potential account numbers
    account_patterns = [
        r'(?:Account|Acct|A/C)(?:\s|:|\s#|\s No\.?:?\s*)(\d[\d-]{6,})',  # Account: XXXXXXXX
        r'(?:\d[\d-]{6,})'  # Just digits and hyphens, at least 7 chars
    ]
    
    for pattern in account_patterns:
        matches = re.findall(pattern, text)
        entities["account_numbers"].extend(matches)
    
    return entities
