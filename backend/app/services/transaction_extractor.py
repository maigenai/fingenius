from typing import Dict, Any, List
import json
from langchain_anthropic import ChatAnthropic
from app.core.config import settings


def extract_transactions(extracted_data: Dict[str, Any], document_type: str) -> List[Dict[str, Any]]:
    """
    Extract transactions from document data using Anthropic Claude.
    """
    # Initialize LLM
    llm = ChatAnthropic(
        model="claude-3-haiku-20240307",
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        temperature=0.1,
    )

    # Prepare data for extraction
    data_json = json.dumps(extracted_data, indent=2)

    # Create the prompt
    prompt = f"""
    You are a Transaction Extraction Specialist with expertise in parsing financial documents and extracting structured transaction data.
    
    Extract all transactions from this {document_type} document data.
    
    Document data:
    {data_json}
    
    For each transaction, extract:
    1. Date (in ISO format YYYY-MM-DD)
    2. Description (merchant name or transaction description)
    3. Amount (as a float)
    4. Category (if available, or infer from description)
    5. Whether it's an expense (true) or income (false)
    6. Flag any suspicious transactions (is_flagged: true/false)
    7. Reason for flagging (if applicable)
    
    Return the transactions as a JSON array of objects, like this:
    [
      {{
        "date": "2023-03-15",
        "description": "AMAZON MARKETPLACE",
        "amount": 45.99,
        "category": "Shopping",
        "is_expense": true,
        "is_flagged": false,
        "flag_reason": null
      }},
      ...
    ]
    
    If no transactions are found, return an empty array.
    Return ONLY the JSON array without any additional text or explanation.
    """

    # Call the LLM
    try:
        response = llm.invoke(prompt)
        
        # Parse the JSON result
        try:
            # Find JSON in the result
            json_start = response.content.find('[')
            json_end = response.content.rfind(']') + 1
            if json_start >= 0 and json_end > json_start:
                json_str = response.content[json_start:json_end]
                transactions = json.loads(json_str)
                return transactions
            else:
                # If no JSON found, return empty list
                return []
        except json.JSONDecodeError:
            # If JSON parsing fails, return empty list
            return []
    except Exception as e:
        print(f"Error calling Anthropic API: {e}")
        return []
