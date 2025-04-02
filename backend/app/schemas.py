from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, EmailStr
from datetime import datetime


class TokenData(BaseModel):
    email: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


class UserBase(BaseModel):
    email: EmailStr
    full_name: str


class UserCreate(UserBase):
    password: str


class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime

    class Config:
        orm_mode = True


class DocumentBase(BaseModel):
    filename: str
    document_type: str
    description: Optional[str] = None


class DocumentCreate(DocumentBase):
    stored_filename: str


class Document(DocumentBase):
    id: int
    status: str
    created_at: datetime
    user_id: int

    class Config:
        orm_mode = True


class TransactionBase(BaseModel):
    date: datetime
    description: str
    amount: float
    category: Optional[str] = None
    is_expense: bool = True
    is_flagged: bool = False
    flag_reason: Optional[str] = None


class TransactionCreate(TransactionBase):
    document_id: int


class Transaction(TransactionBase):
    id: int
    document_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class InsightBase(BaseModel):
    insight_type: str
    title: str
    content: str
    importance: int


class InsightCreate(InsightBase):
    document_id: int


class Insight(InsightBase):
    id: int
    document_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class DisputeBase(BaseModel):
    reason: str
    details: str


class DisputeCreate(DisputeBase):
    letter_content: Optional[str] = None


class Dispute(DisputeBase):
    id: int
    letter_content: str
    status: str
    document_id: int
    created_at: datetime

    class Config:
        orm_mode = True


class DocumentDetail(Document):
    extracted_data: Optional[Dict[str, Any]] = None
    transactions: List[Transaction] = []
    insights: List[Insight] = []
    disputes: List[Dispute] = []

    class Config:
        orm_mode = True
