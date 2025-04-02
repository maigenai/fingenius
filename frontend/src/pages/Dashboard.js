import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Paper, 
  Button,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // This would normally fetch data from the API
  const recentDocuments = [
    {
      id: '1',
      filename: 'bank_statement_march_2023.pdf',
      document_type: 'Bank Statement',
      upload_date: '2023-04-01T14:30:00Z'
    },
    {
      id: '2',
      filename: 'credit_card_statement_march_2023.pdf',
      document_type: 'Credit Card Statement',
      upload_date: '2023-03-28T10:15:00Z'
    },
    {
      id: '3',
      filename: 'utility_bill_march_2023.pdf',
      document_type: 'Utility Bill',
      upload_date: '2023-03-25T16:45:00Z'
    }
  ];

  // This would normally fetch data from the API
  const recentInsights = [
    {
      id: '1',
      title: 'High Dining Expenses',
      document_id: '1',
      importance: 4
    },
    {
      id: '2',
      title: 'Unusual Transaction Detected',
      document_id: '2',
      importance: 5
    },
    {
      id: '3',
      title: 'Potential Savings Opportunity',
      document_id: '1',
      importance: 3
    }
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h4" gutterBottom>
                  Welcome to FinGenius
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Your AI-powered financial document analysis tool
                </Typography>
              </Box>
              <Button 
                component={Link}
                to="/documents"
                variant="contained" 
                color="primary"
              >
                Upload New Document
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent Documents */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Recent Documents
              </Typography>
              <Button 
                component={Link}
                to="/documents"
                size="small"
              >
                View All
              </Button>
            </Box>
            <Divider />
            <List>
              {recentDocuments.map((doc) => (
                <ListItem 
                  key={doc.id}
                  component={Link}
                  to={`/documents/${doc.id}`}
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemText
                    primary={doc.filename}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="text.primary">
                          {doc.document_type}
                        </Typography>
                        {" — "}
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Recent Insights */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Recent Insights
            </Typography>
            <Divider />
            <List>
              {recentInsights.map((insight) => (
                <ListItem 
                  key={insight.id}
                  component={Link}
                  to={`/insights/${insight.document_id}`}
                  sx={{ 
                    textDecoration: 'none', 
                    color: 'inherit',
                    borderLeft: `4px solid ${
                      insight.importance >= 4
                        ? '#f44336'
                        : insight.importance >= 3
                        ? '#ff9800'
                        : '#4caf50'
                    }`,
                    pl: 2,
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemText
                    primary={insight.title}
                    secondary={`Priority: ${
                      insight.importance === 5
                        ? 'Critical'
                        : insight.importance === 4
                        ? 'High'
                        : insight.importance === 3
                        ? 'Medium'
                        : insight.importance === 2
                        ? 'Low'
                        : 'Very Low'
                    }`}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Stats */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" component="h2" gutterBottom>
              Quick Stats
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="primary">
                    3
                  </Typography>
                  <Typography variant="body1">
                    Documents Analyzed
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="secondary">
                    5
                  </Typography>
                  <Typography variant="body1">
                    Insights Generated
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h3" color="success.main">
                    1
                  </Typography>
                  <Typography variant="body1">
                    Disputes Created
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;
