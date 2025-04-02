from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Text, DateTime, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    documents = relationship("Document", back_populates="user")


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String)
    stored_filename = Column(String, unique=True)
    document_type = Column(String)  # e.g., "bank_statement", "invoice", "bill"
    description = Column(Text, nullable=True)
    status = Column(String, default="pending")  # pending, processing, completed, failed
    extracted_data = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    user_id = Column(Integer, ForeignKey("users.id"))

    user = relationship("User", back_populates="documents")
    insights = relationship("Insight", back_populates="document")
    disputes = relationship("Dispute", back_populates="document")
    transactions = relationship("Transaction", back_populates="document")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(DateTime(timezone=True))
    description = Column(Text)
    amount = Column(Float)
    category = Column(String, nullable=True)
    is_expense = Column(Boolean, default=True)
    is_flagged = Column(Boolean, default=False)
    flag_reason = Column(Text, nullable=True)
    document_id = Column(Integer, ForeignKey("documents.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="transactions")


class Insight(Base):
    __tablename__ = "insights"

    id = Column(Integer, primary_key=True, index=True)
    insight_type = Column(String)  # e.g., "spending_pattern", "anomaly", "recommendation"
    title = Column(String)
    content = Column(Text)
    importance = Column(Integer)  # 1-5 scale
    document_id = Column(Integer, ForeignKey("documents.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="insights")


class Dispute(Base):
    __tablename__ = "disputes"

    id = Column(Integer, primary_key=True, index=True)
    reason = Column(String)
    details = Column(Text)
    letter_content = Column(Text)
    status = Column(String, default="draft")  # draft, sent, resolved
    document_id = Column(Integer, ForeignKey("documents.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    document = relationship("Document", back_populates="disputes")
