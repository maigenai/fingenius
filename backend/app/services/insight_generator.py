from typing import Dict, Any, List
from langchain_anthropic import ChatAnthropic
from app.core.config import settings
import json


def generate_insights(
    extracted_data: Dict[str, Any], 
    transactions: List[Dict[str, Any]], 
    document_type: str
) -> List[Dict[str, Any]]:
    """
    Generate insights from extracted document data using Anthropic Claude.
    """
    # Initialize LLM
    llm = ChatAnthropic(
        model="claude-3-sonnet-20240229",
        anthropic_api_key=settings.ANTHROPIC_API_KEY,
        temperature=0.2,
    )

    # Prepare data for analysis
    data_for_analysis = {
        "document_type": document_type,
        "extracted_data": extracted_data,
        "transactions": transactions[:50]  # Limit to avoid token limits
    }
    data_json = json.dumps(data_for_analysis, indent=2)

    # Create the prompt
    prompt = f"""
    You are a team of financial experts analyzing financial data to provide valuable insights.
    
    First, as a Financial Analyst, analyze the financial data and identify important patterns or trends.
    
    Financial data:
    {data_json}
    
    Focus on:
    1. Spending patterns and categories
    2. Income vs. expenses
    3. Recurring transactions
    4. Changes over time (if applicable)
    5. Unusual or outlier transactions
    
    Then, as a Fraud Detection Specialist, review the financial data for potential fraud, errors, or issues that should be disputed.
    
    Focus on:
    1. Unauthorized transactions
    2. Double charges
    3. Incorrect fees or interest
    4. Suspicious patterns
    5. Billing errors
    
    Finally, as a Financial Advisor, provide actionable financial recommendations based on the analysis.
    
    Your recommendations should:
    1. Address specific issues identified in the analysis
    2. Suggest ways to optimize spending or reduce fees
    3. Identify opportunities for savings
    4. Provide clear next steps for the user
    
    Format your response as a list of specific insights, each with:
    - A clear title
    - A detailed explanation
    - An importance rating (1-5, with 5 being highest)
    - A categorization (spending_pattern, anomaly, recommendation, etc.)
    
    Return your insights in JSON format like this:
    [
      {{
        "type": "anomaly",
        "title": "Potential duplicate charge from Amazon",
        "content": "There appear to be two identical charges of $45.99 from Amazon on March 15th and 16th. This may be a duplicate charge that should be investigated.",
        "importance": 4
      }},
      ...
    ]
    
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
                insights = json.loads(json_str)
                return insights
            else:
                # If no JSON found, return a default insight
                return [{
                    "type": "system",
                    "title": "Document Analysis Complete",
                    "content": "The document has been processed. Please check the extracted data for details.",
                    "importance": 3
                }]
        except json.JSONDecodeError:
            # If JSON parsing fails, return a default insight
            return [{
                "type": "system",
                "title": "Document Analysis Complete",
                "content": "The document has been processed. Please check the extracted data for details.",
                "importance": 3
            }]
    except Exception as e:
        print(f"Error calling Anthropic API: {e}")
        return [{
            "type": "system",
            "title": "Error Generating Insights",
            "content": f"An error occurred while generating insights: {str(e)}",
            "importance": 4
        }]
