from fastapi import FastAPI, Depends, HTTPException, status, File, UploadFile, Form, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List, Optional
import os
import uuid
import json
from datetime import datetime, timedelta

from app.database import get_db, engine
from app import models, schemas, crud
from app.core.config import settings
from app.core.security import create_access_token, get_password_hash, verify_password, get_current_user
from app.worker import process_document_task

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="AI-Powered Financial Document Analysis Platform",
    version="1.0.0",
)

# Set up CORS
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")


@app.get("/")
def read_root():
    return {"message": "Welcome to FinGenius API"}


@app.post(f"{settings.API_V1_STR}/auth/register", response_model=schemas.User)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )
    return crud.create_user(db=db, user=user)


@app.post(f"{settings.API_V1_STR}/auth/login", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = crud.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.email}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get(f"{settings.API_V1_STR}/users/me", response_model=schemas.User)
def read_users_me(current_user: models.User = Depends(get_current_user)):
    return current_user


@app.post(f"{settings.API_V1_STR}/documents/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    document_type: str = Form(...),
    description: Optional[str] = Form(None),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # Validate file type
    allowed_extensions = [".pdf", ".png", ".jpg", ".jpeg"]
    file_ext = os.path.splitext(file.filename)[1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}",
        )

    # Create unique filename
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(settings.DOCUMENT_STORAGE_PATH, unique_filename)

    # Save file
    os.makedirs(os.path.dirname(file_path), exist_ok=True)
    with open(file_path, "wb") as buffer:
        buffer.write(await file.read())

    # Create document record in database
    document = crud.create_document(
        db=db,
        document=schemas.DocumentCreate(
            filename=file.filename,
            stored_filename=unique_filename,
            document_type=document_type,
            description=description,
        ),
        user_id=current_user.id,
    )

    # Process document in background
    background_tasks.add_task(process_document_task, document.id)

    return {"id": document.id, "status": "Document uploaded and processing started"}


@app.get(f"{settings.API_V1_STR}/documents", response_model=List[schemas.Document])
def get_documents(
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    documents = crud.get_user_documents(db, user_id=current_user.id, skip=skip, limit=limit)
    return documents


@app.get(f"{settings.API_V1_STR}/documents/{{document_id}}", response_model=schemas.DocumentDetail)
def get_document(
    document_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = crud.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document",
        )
    return document


@app.get(f"{settings.API_V1_STR}/insights/{{document_id}}", response_model=List[schemas.Insight])
def get_document_insights(
    document_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = crud.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document",
        )
    
    insights = crud.get_document_insights(db, document_id=document_id)
    return insights


@app.post(f"{settings.API_V1_STR}/disputes/generate/{{document_id}}", response_model=schemas.Dispute)
def generate_dispute(
    document_id: int,
    dispute_data: schemas.DisputeCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    document = crud.get_document(db, document_id=document_id)
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found",
        )
    if document.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this document",
        )
    
    # Generate dispute letter using CrewAI
    from app.services.dispute_generator import generate_dispute_letter
    dispute_letter = generate_dispute_letter(document, dispute_data.reason, dispute_data.details)
    
    # Create dispute record
    dispute = crud.create_dispute(
        db=db,
        dispute=schemas.DisputeCreate(
            reason=dispute_data.reason,
            details=dispute_data.details,
            letter_content=dispute_letter,
        ),
        document_id=document_id,
    )
    
    return dispute


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
