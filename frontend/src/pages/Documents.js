import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid
} from '@mui/material';
import { Link } from 'react-router-dom';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DeleteIcon from '@mui/icons-material/Delete';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const Documents = () => {
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [documentType, setDocumentType] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  
  // This would normally fetch data from the API
  const documents = [
    {
      id: '1',
      filename: 'bank_statement_march_2023.pdf',
      document_type: 'Bank Statement',
      upload_date: '2023-04-01T14:30:00Z',
      status: 'Processed'
    },
    {
      id: '2',
      filename: 'credit_card_statement_march_2023.pdf',
      document_type: 'Credit Card Statement',
      upload_date: '2023-03-28T10:15:00Z',
      status: 'Processed'
    },
    {
      id: '3',
      filename: 'utility_bill_march_2023.pdf',
      document_type: 'Utility Bill',
      upload_date: '2023-03-25T16:45:00Z',
      status: 'Processed'
    }
  ];

  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
    setDocumentType('');
    setSelectedFile(null);
  };

  const handleDocumentTypeChange = (event) => {
    setDocumentType(event.target.value);
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleUpload = () => {
    // This would normally upload the file to the API
    console.log('Uploading file:', selectedFile);
    console.log('Document type:', documentType);
    handleCloseUploadDialog();
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Documents
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<CloudUploadIcon />}
          onClick={handleOpenUploadDialog}
        >
          Upload Document
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Filename</TableCell>
              <TableCell>Document Type</TableCell>
              <TableCell>Upload Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {documents.map((doc) => (
              <TableRow key={doc.id}>
                <TableCell>{doc.filename}</TableCell>
                <TableCell>{doc.document_type}</TableCell>
                <TableCell>{new Date(doc.upload_date).toLocaleString()}</TableCell>
                <TableCell>{doc.status}</TableCell>
                <TableCell align="right">
                  <IconButton 
                    component={Link}
                    to={`/documents/${doc.id}`}
                    color="primary"
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton 
                    color="error"
                    size="small"
                    onClick={() => {
                      // This would normally delete the document
                      console.log('Delete document:', doc.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Upload Dialog */}
      <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog}>
        <DialogTitle>Upload Document</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel id="document-type-label">Document Type</InputLabel>
                <Select
                  labelId="document-type-label"
                  id="document-type"
                  value={documentType}
                  label="Document Type"
                  onChange={handleDocumentTypeChange}
                >
                  <MenuItem value="bank_statement">Bank Statement</MenuItem>
                  <MenuItem value="credit_card_statement">Credit Card Statement</MenuItem>
                  <MenuItem value="utility_bill">Utility Bill</MenuItem>
                  <MenuItem value="tax_document">Tax Document</MenuItem>
                  <MenuItem value="invoice">Invoice</MenuItem>
                  <MenuItem value="receipt">Receipt</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="outlined"
                component="label"
                fullWidth
                sx={{ height: '100px', border: '2px dashed #ccc' }}
              >
                {selectedFile ? selectedFile.name : 'Click to select file or drag and drop'}
                <input
                  type="file"
                  hidden
                  onChange={handleFileChange}
                  accept=".pdf,.png,.jpg,.jpeg"
                />
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog}>Cancel</Button>
          <Button 
            onClick={handleUpload}
            variant="contained"
            disabled={!documentType || !selectedFile}
          >
            Upload
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Documents;
