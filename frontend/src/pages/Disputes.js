import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Grid
} from '@mui/material';
import { useParams } from 'react-router-dom';

const Disputes = () => {
  const { documentId } = useParams();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  
  const handleReasonChange = (event) => {
    setReason(event.target.value);
  };
  
  const handleDetailsChange = (event) => {
    setDetails(event.target.value);
  };
  
  const handleGenerateLetter = () => {
    // This would normally call the API to generate a letter
    setGeneratedLetter(`
[Your Name]
[Your Address]
[City, State ZIP]
[Your Phone Number]
[Your Email]

[Date]

[Company Name]
[Company Address]
[City, State ZIP]

Re: Dispute of Charge - Account Number: XXXX-XXXX-XXXX-1234

To Whom It May Concern:

I am writing to dispute a charge on my account in the amount of $XX.XX that posted on [date]. I believe this charge is incorrect because ${details}.

According to the Fair Credit Billing Act, I have the right to dispute charges that I believe are erroneous and request that they be investigated and corrected.

Please investigate this matter and credit my account for the disputed amount. I have attached copies of relevant documentation supporting my position.

If you have any questions or need additional information, please contact me at the phone number or email address listed above.

Thank you for your prompt attention to this matter.

Sincerely,

[Your Name]

Enclosures: [List any documents you're attaching]
    `);
  };
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Generate Dispute Letter
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Document ID: {documentId}
      </Typography>
      
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Dispute Information
            </Typography>
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="reason-label">Reason for Dispute</InputLabel>
              <Select
                labelId="reason-label"
                id="reason"
                value={reason}
                label="Reason for Dispute"
                onChange={handleReasonChange}
              >
                <MenuItem value="unauthorized_charge">Unauthorized Charge</MenuItem>
                <MenuItem value="duplicate_charge">Duplicate Charge</MenuItem>
                <MenuItem value="incorrect_amount">Incorrect Amount</MenuItem>
                <MenuItem value="service_not_provided">Service Not Provided</MenuItem>
                <MenuItem value="defective_merchandise">Defective Merchandise</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
            
            <TextField
              id="details"
              label="Dispute Details"
              multiline
              rows={6}
              value={details}
              onChange={handleDetailsChange}
              fullWidth
              margin="normal"
              placeholder="Please provide specific details about your dispute..."
            />
            
            <Button 
              variant="contained" 
              color="primary" 
              sx={{ mt: 2 }}
              onClick={handleGenerateLetter}
              disabled={!reason || !details}
            >
              Generate Dispute Letter
            </Button>
          </Paper>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Generated Letter
            </Typography>
            
            {generatedLetter ? (
              <Box 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'monospace',
                  p: 2,
                  border: '1px solid #ddd',
                  borderRadius: 1,
                  maxHeight: '500px',
                  overflow: 'auto'
                }}
              >
                {generatedLetter}
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Fill out the form and click "Generate Dispute Letter" to create a customized dispute letter.
              </Typography>
            )}
            
            {generatedLetter && (
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => {
                  // This would normally download or print the letter
                  alert('Download functionality would be implemented here');
                }}
              >
                Download Letter
              </Button>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Disputes;
