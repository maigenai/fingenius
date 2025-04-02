from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.security import get_password_hash, verify_password
from app import models, schemas


def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email=email)
    if not user:
        return False
    if not verify_password(password, user.hashed_password):
        return False
    return user


def get_document(db: Session, document_id: int):
    return db.query(models.Document).filter(models.Document.id == document_id).first()


def get_user_documents(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Document)
        .filter(models.Document.user_id == user_id)
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_document(db: Session, document: schemas.DocumentCreate, user_id: int):
    db_document = models.Document(
        filename=document.filename,
        stored_filename=document.stored_filename,
        document_type=document.document_type,
        description=document.description,
        user_id=user_id,
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document


def update_document_status(db: Session, document_id: int, status: str):
    db_document = get_document(db, document_id=document_id)
    if db_document:
        db_document.status = status
        db.commit()
        db.refresh(db_document)
    return db_document


def update_document_extracted_data(db: Session, document_id: int, extracted_data: dict):
    db_document = get_document(db, document_id=document_id)
    if db_document:
        db_document.extracted_data = extracted_data
        db.commit()
        db.refresh(db_document)
    return db_document


def create_transaction(db: Session, transaction: schemas.TransactionCreate):
    db_transaction = models.Transaction(
        date=transaction.date,
        description=transaction.description,
        amount=transaction.amount,
        category=transaction.category,
        is_expense=transaction.is_expense,
        is_flagged=transaction.is_flagged,
        flag_reason=transaction.flag_reason,
        document_id=transaction.document_id,
    )
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction


def get_document_transactions(db: Session, document_id: int):
    return (
        db.query(models.Transaction)
        .filter(models.Transaction.document_id == document_id)
        .all()
    )


def create_insight(db: Session, insight: schemas.InsightCreate):
    db_insight = models.Insight(
        insight_type=insight.insight_type,
        title=insight.title,
        content=insight.content,
        importance=insight.importance,
        document_id=insight.document_id,
    )
    db.add(db_insight)
    db.commit()
    db.refresh(db_insight)
    return db_insight


def get_document_insights(db: Session, document_id: int):
    return (
        db.query(models.Insight)
        .filter(models.Insight.document_id == document_id)
        .all()
    )


def create_dispute(db: Session, dispute: schemas.DisputeCreate, document_id: int):
    db_dispute = models.Dispute(
        reason=dispute.reason,
        details=dispute.details,
        letter_content=dispute.letter_content,
        document_id=document_id,
    )
    db.add(db_dispute)
    db.commit()
    db.refresh(db_dispute)
    return db_dispute


def get_document_disputes(db: Session, document_id: int):
    return (
        db.query(models.Dispute)
        .filter(models.Dispute.document_id == document_id)
        .all()
    )
