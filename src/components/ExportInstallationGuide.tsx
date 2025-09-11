'use client';

import React from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  AlertTitle,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CodeIcon from '@mui/icons-material/Code';

const ExportInstallationGuide: React.FC = () => {
  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 3,
          color: '#1F2A44',
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 'bold',
        }}
      >
        Export Installation Guide
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <AlertTitle>Export Functionality</AlertTitle>
        CSV export is always available, but PDF and Excel exports require
        additional packages.
      </Alert>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CodeIcon />
            <Typography
              sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
            >
              Install Required Packages
            </Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ fontFamily: 'monospace', fontSize: '14px' }}>
            <Typography sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
              <strong>For PDF Export:</strong>
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                mb: 2,
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              npm install jspdf jspdf-autotable
            </Box>

            <Typography sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
              <strong>For Excel Export:</strong>
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                mb: 2,
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              npm install xlsx
            </Box>

            <Typography sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
              <strong>Install All Packages:</strong>
            </Typography>
            <Box
              sx={{
                backgroundColor: '#f5f5f5',
                p: 2,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '13px',
              }}
            >
              npm install jspdf jspdf-autotable xlsx
            </Box>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography
            sx={{ fontFamily: 'Poppins, sans-serif', fontWeight: 600 }}
          >
            Export Features
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box>
            <Typography sx={{ mb: 2, fontFamily: 'Poppins, sans-serif' }}>
              <strong>CSV Export (Always Available):</strong>
            </Typography>
            <ul style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              <li>All product fields included</li>
              <li>Proper CSV formatting with headers</li>
              <li>Handles special characters and quotes</li>
              <li>No external dependencies required</li>
            </ul>

            <Typography
              sx={{ mb: 2, mt: 3, fontFamily: 'Poppins, sans-serif' }}
            >
              <strong>PDF Export (Requires Packages):</strong>
            </Typography>
            <ul style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              <li>Professional table layout</li>
              <li>Multiple pages for detailed product info</li>
              <li>Blue headers and alternating row colors</li>
              <li>Export date and title included</li>
            </ul>

            <Typography
              sx={{ mb: 2, mt: 3, fontFamily: 'Poppins, sans-serif' }}
            >
              <strong>Excel Export (Requires Packages):</strong>
            </Typography>
            <ul style={{ fontFamily: 'Poppins, sans-serif', fontSize: '14px' }}>
              <li>Multiple sheets (Products + Summary)</li>
              <li>All product fields included</li>
              <li>Statistics summary sheet</li>
              <li>Proper column widths</li>
            </ul>
          </Box>
        </AccordionDetails>
      </Accordion>

      <Alert severity="success" sx={{ mt: 3 }}>
        <AlertTitle>Ready to Export!</AlertTitle>
        Once you've installed the packages, restart your development server and
        the export options will be available.
      </Alert>
    </Box>
  );
};

export default ExportInstallationGuide;
