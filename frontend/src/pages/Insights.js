import React from 'react';
import { Box, Typography, Container, Paper, Grid, Chip } from '@mui/material';
import { useParams } from 'react-router-dom';

const Insights = () => {
  const { documentId } = useParams();
  
  // This would normally fetch data from the API
  const insights = [
    {
      id: 1,
      type: 'spending_pattern',
      title: 'High Dining Expenses',
      content: 'Your dining expenses represent 25% of your total spending this month, which is higher than your usual 15%.',
      importance: 4
    },
    {
      id: 2,
      type: 'anomaly',
      title: 'Unusual Transaction Detected',
      content: 'There was an unusual transaction of $499.99 at Electronics Store on March 15th that doesn\'t match your typical spending pattern.',
      importance: 5
    },
    {
      id: 3,
      type: 'recommendation',
      title: 'Potential Savings Opportunity',
      content: 'You\'re currently paying $15/month for a subscription service you haven\'t used in 3 months. Consider cancelling to save $180/year.',
      importance: 3
    }
  ];

  const getChipColor = (type) => {
    switch (type) {
      case 'spending_pattern':
        return 'info';
      case 'anomaly':
        return 'error';
      case 'recommendation':
        return 'success';
      default:
        return 'default';
    }
  };

  const getImportanceLabel = (importance) => {
    switch (importance) {
      case 5:
        return 'Critical';
      case 4:
        return 'High';
      case 3:
        return 'Medium';
      case 2:
        return 'Low';
      case 1:
        return 'Very Low';
      default:
        return 'Unknown';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Document Insights
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        Document ID: {documentId}
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {insights.map((insight) => (
          <Grid item xs={12} key={insight.id}>
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                borderLeft: `6px solid ${
                  insight.importance >= 4
                    ? '#f44336'
                    : insight.importance >= 3
                    ? '#ff9800'
                    : '#4caf50'
                }`,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6">{insight.title}</Typography>
                <Box>
                  <Chip
                    label={insight.type.replace('_', ' ')}
                    color={getChipColor(insight.type)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                  <Chip
                    label={`${getImportanceLabel(insight.importance)} Priority`}
                    variant="outlined"
                    size="small"
                  />
                </Box>
              </Box>
              <Typography variant="body1">{insight.content}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Insights;
