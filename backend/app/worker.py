from celery import Celery
from sqlalchemy.orm import Session
import os
import json
from datetime import datetime

from app.core.config import settings
from app.database import SessionLocal
from app import crud, models, schemas
from app.services.document_processor import process_document
from app.services.insight_generator import generate_insights
from app.services.transaction_extractor import extract_transactions

celery_app = Celery("worker", broker=settings.REDIS_URL)

celery_app.conf.task_routes = {
    "app.worker.process_document_task": "main-queue",
}


@celery_app.task(name="app.worker.process_document_task")
def process_document_task(document_id: int):
    """
    Process a document in the background.
    """
    db = SessionLocal()
    try:
        # Get document
        document = crud.get_document(db, document_id=document_id)
        if not document:
            return {"status": "error", "message": "Document not found"}

        # Update status to processing
        crud.update_document_status(db, document_id=document_id, status="processing")

        # Get file path
        file_path = os.path.join(settings.DOCUMENT_STORAGE_PATH, document.stored_filename)
        if not os.path.exists(file_path):
            crud.update_document_status(db, document_id=document_id, status="failed")
            return {"status": "error", "message": "Document file not found"}

        # Process document
        extracted_data = process_document(file_path, document.document_type)
        if not extracted_data:
            crud.update_document_status(db, document_id=document_id, status="failed")
            return {"status": "error", "message": "Failed to extract data from document"}

        # Update document with extracted data
        crud.update_document_extracted_data(db, document_id=document_id, extracted_data=extracted_data)

        # Extract transactions
        transactions = extract_transactions(extracted_data, document.document_type)
        for transaction_data in transactions:
            transaction = schemas.TransactionCreate(
                date=datetime.fromisoformat(transaction_data["date"]),
                description=transaction_data["description"],
                amount=transaction_data["amount"],
                category=transaction_data.get("category"),
                is_expense=transaction_data.get("is_expense", True),
                is_flagged=transaction_data.get("is_flagged", False),
                flag_reason=transaction_data.get("flag_reason"),
                document_id=document_id,
            )
            crud.create_transaction(db, transaction=transaction)

        # Generate insights
        insights = generate_insights(extracted_data, transactions, document.document_type)
        for insight_data in insights:
            insight = schemas.InsightCreate(
                insight_type=insight_data["type"],
                title=insight_data["title"],
                content=insight_data["content"],
                importance=insight_data["importance"],
                document_id=document_id,
            )
            crud.create_insight(db, insight=insight)

        # Update status to completed
        crud.update_document_status(db, document_id=document_id, status="completed")

        return {"status": "success", "document_id": document_id}

    except Exception as e:
        # Update status to failed
        crud.update_document_status(db, document_id=document_id, status="failed")
        return {"status": "error", "message": str(e)}
    finally:
        db.close()
