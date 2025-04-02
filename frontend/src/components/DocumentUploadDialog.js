import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  LinearProgress,
  Alert,
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { API_URL, DOCUMENT_TYPES } from '../config';

const DocumentUploadDialog = ({ open, onClose }) => {
  const [file, setFile] = useState(null);
  const [documentType, setDocumentType] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        setFile(acceptedFiles[0]);
      }
    },
  });

  const handleSubmit = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('document_type', documentType);
      if (description) {
        formData.append('description', description);
      }

      const token = localStorage.getItem('token');
      
      await axios.post(`${API_URL}/api/v1/documents/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`,
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      setUploading(false);
      onClose(true);
    } catch (error) {
      setUploading(false);
      setError(error.response?.data?.detail || 'Failed to upload document');
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setDocumentType('');
      setDescription('');
      setError('');
      setUploadProgress(0);
      onClose(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Upload Document</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed #cccccc',
            borderRadius: 2,
            p: 3,
            mb: 3,
            textAlign: 'center',
            cursor: 'pointer',
            bgcolor: 'background.paper',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        >
          <input {...getInputProps()} />
          {file ? (
            <Typography>
              Selected file: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
            </Typography>
          ) : (
            <Typography>
              Drag and drop a file here, or click to select a file
              <br />
              <Typography variant="caption" color="textSecondary">
                Supported formats: PDF, JPG, PNG
              </Typography>
            </Typography>
          )}
        </Box>

        <FormControl fullWidth margin="normal">
          <InputLabel id="document-type-label">Document Type</InputLabel>
          <Select
            labelId="document-type-label"
            id="document-type"
            value={documentType}
            label="Document Type"
            onChange={(e) => setDocumentType(e.target.value)}
            disabled={uploading}
          >
            {DOCUMENT_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <TextField
          margin="normal"
          fullWidth
          id="description"
          label="Description (Optional)"
          multiline
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={uploading}
        />

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Uploading: {uploadProgress}%
            </Typography>
            <LinearProgress variant="determinate" value={uploadProgress} />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={uploading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={!file || !documentType || uploading}
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DocumentUploadDialog;
