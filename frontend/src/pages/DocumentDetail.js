import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Paper, 
  Grid, 
  Button, 
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip
} from '@mui/material';
import { useParams, Link } from 'react-router-dom';

const DocumentDetail = () => {
  const { id } = useParams();
  
  // This would normally fetch data from the API
  const document = {
    id,
    filename: 'bank_statement_march_2023.pdf',
    document_type: 'Bank Statement',
    upload_date: '2023-04-01T14:30:00Z',
    extracted_data: {
      account_number: 'XXXX-XXXX-1234',
      statement_period: 'March 1-31, 2023',
      opening_balance: 2450.75,
      closing_balance: 2150.25,
      total_deposits: 3200.00,
      total_withdrawals: 3500.50
    }
  };
  
  // This would normally fetch data from the API
  const transactions = [
    {
      id: 1,
      date: '2023-03-02',
      description: 'DIRECT DEPOSIT - ACME CORP',
      amount: 1500.00,
      category: 'Income',
      is_expense: false
    },
    {
      id: 2,
      date: '2023-03-05',
      description: 'AMAZON.COM',
      amount: 45.99,
      category: 'Shopping',
      is_expense: true
    },
    {
      id: 3,
      date: '2023-03-10',
      description: 'GROCERY STORE',
      amount: 125.45,
      category: 'Groceries',
      is_expense: true,
      is_flagged: true,
      flag_reason: 'Amount higher than usual for this category'
    },
    {
      id: 4,
      date: '2023-03-15',
      description: 'DIRECT DEPOSIT - ACME CORP',
      amount: 1500.00,
      category: 'Income',
      is_expense: false
    },
    {
      id: 5,
      date: '2023-03-20',
      description: 'MORTGAGE PAYMENT',
      amount: 1200.00,
      category: 'Housing',
      is_expense: true
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Document Details
        </Typography>
        <Box>
          <Button 
            component={Link} 
            to={`/insights/${id}`} 
            variant="contained" 
            color="primary"
            sx={{ mr: 2 }}
          >
            View Insights
          </Button>
          <Button 
            component={Link} 
            to={`/disputes/${id}`} 
            variant="outlined" 
            color="primary"
          >
            Create Dispute
          </Button>
        </Box>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Document Information
            </Typography>
            <List dense>
              <ListItem>
                <ListItemText 
                  primary="Filename" 
                  secondary={document.filename} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Document Type" 
                  secondary={document.document_type} 
                />
              </ListItem>
              <ListItem>
                <ListItemText 
                  primary="Upload Date" 
                  secondary={new Date(document.upload_date).toLocaleString()} 
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Extracted Data
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Account Number</Typography>
                <Typography variant="body1" gutterBottom>
                  {document.extracted_data.account_number}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Statement Period</Typography>
                <Typography variant="body1" gutterBottom>
                  {document.extracted_data.statement_period}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Opening Balance</Typography>
                <Typography variant="body1" gutterBottom>
                  ${document.extracted_data.opening_balance.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Closing Balance</Typography>
                <Typography variant="body1" gutterBottom>
                  ${document.extracted_data.closing_balance.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Total Deposits</Typography>
                <Typography variant="body1" gutterBottom>
                  ${document.extracted_data.total_deposits.toFixed(2)}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2">Total Withdrawals</Typography>
                <Typography variant="body1" gutterBottom>
                  ${document.extracted_data.total_withdrawals.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Transactions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            
            {transactions.map((transaction) => (
              <Box 
                key={transaction.id}
                sx={{ 
                  py: 1.5, 
                  borderBottom: '1px solid #eee',
                  backgroundColor: transaction.is_flagged ? '#fff8e1' : 'transparent'
                }}
              >
                <Grid container alignItems="center">
                  <Grid item xs={2}>
                    <Typography variant="body2">
                      {new Date(transaction.date).toLocaleDateString()}
                    </Typography>
                  </Grid>
                  <Grid item xs={5}>
                    <Typography variant="body1">
                      {transaction.description}
                    </Typography>
                    {transaction.is_flagged && (
                      <Typography variant="caption" color="error">
                        {transaction.flag_reason}
                      </Typography>
                    )}
                  </Grid>
                  <Grid item xs={2}>
                    <Chip 
                      label={transaction.category} 
                      size="small" 
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={3}>
                    <Typography 
                      variant="body1" 
                      align="right"
                      color={transaction.is_expense ? 'error' : 'success.main'}
                      fontWeight="medium"
                    >
                      {transaction.is_expense ? '-' : '+'} ${transaction.amount.toFixed(2)}
                    </Typography>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default DocumentDetail;
