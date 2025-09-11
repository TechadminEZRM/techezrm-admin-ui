'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import TableChartIcon from '@mui/icons-material/TableChart';
import DescriptionIcon from '@mui/icons-material/Description';
import Image from 'next/image';

interface ExportModalProps {
  open: boolean;
  onClose: () => void;
  onExport: (format: 'pdf' | 'excel' | 'csv') => Promise<void>;
  isLoading?: boolean;
}

const ExportModal: React.FC<ExportModalProps> = ({
  open,
  onClose,
  onExport,
  isLoading = false,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<
    'pdf' | 'excel' | 'csv' | null
  >(null);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setSelectedFormat(format);
    try {
      await onExport(format);
    } finally {
      setSelectedFormat(null);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setSelectedFormat(null);
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '12px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          fontFamily: 'Poppins, sans-serif',
        }}
      >
        <Typography
          sx={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#1F2A44',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Export Products
        </Typography>
        <IconButton
          onClick={handleClose}
          size="small"
          disabled={isLoading}
          sx={{ p: 0 }}
        >
          <Image src="/Close.png" alt="Close" width={16} height={16} />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3, pt: 2 }}>
        <Typography
          sx={{
            fontSize: '14px',
            color: '#737791',
            fontFamily: 'Poppins, sans-serif',
            mb: 3,
          }}
        >
          Choose the format you want to export your products data:
        </Typography>

        <Box sx={{ display: 'flex', gap: 2, flexDirection: 'column' }}>
          {/* PDF Option */}
          <Button
            variant="outlined"
            onClick={() => handleExport('pdf')}
            disabled={isLoading}
            startIcon={
              selectedFormat === 'pdf' && isLoading ? (
                <CircularProgress size={16} />
              ) : (
                <PictureAsPdfIcon sx={{ color: '#DC2626' }} />
              )
            }
            sx={{
              p: 2,
              justifyContent: 'flex-start',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1F2A44',
              '&:hover': {
                borderColor: '#DC2626',
                backgroundColor: 'rgba(220, 38, 38, 0.04)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            <Box sx={{ ml: 1 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1F2A44',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Export as PDF
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#737791',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Download products data as a PDF document
              </Typography>
            </Box>
          </Button>

          {/* Excel Option */}
          <Button
            variant="outlined"
            onClick={() => handleExport('excel')}
            disabled={isLoading}
            startIcon={
              selectedFormat === 'excel' && isLoading ? (
                <CircularProgress size={16} />
              ) : (
                <TableChartIcon sx={{ color: '#06A561' }} />
              )
            }
            sx={{
              p: 2,
              justifyContent: 'flex-start',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1F2A44',
              '&:hover': {
                borderColor: '#06A561',
                backgroundColor: 'rgba(6, 165, 97, 0.04)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            <Box sx={{ ml: 1 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1F2A44',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Export as Excel
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#737791',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Download products data as an Excel spreadsheet
              </Typography>
            </Box>
          </Button>

          {/* CSV Option */}
          <Button
            variant="outlined"
            onClick={() => handleExport('csv')}
            disabled={isLoading}
            startIcon={
              selectedFormat === 'csv' && isLoading ? (
                <CircularProgress size={16} />
              ) : (
                <DescriptionIcon sx={{ color: '#1976d2' }} />
              )
            }
            sx={{
              p: 2,
              justifyContent: 'flex-start',
              border: '2px solid #E5E7EB',
              borderRadius: '8px',
              textTransform: 'none',
              fontFamily: 'Poppins, sans-serif',
              fontSize: '14px',
              fontWeight: 500,
              color: '#1F2A44',
              '&:hover': {
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
              '&:disabled': {
                opacity: 0.6,
              },
            }}
          >
            <Box sx={{ ml: 1 }}>
              <Typography
                sx={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: '#1F2A44',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Export as CSV
              </Typography>
              <Typography
                sx={{
                  fontSize: '12px',
                  color: '#737791',
                  fontFamily: 'Poppins, sans-serif',
                }}
              >
                Download products data as a CSV file (No dependencies required)
              </Typography>
            </Box>
          </Button>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button
          onClick={handleClose}
          disabled={isLoading}
          sx={{
            fontSize: '14px',
            color: '#737791',
            textTransform: 'none',
            fontFamily: 'Poppins, sans-serif',
            fontWeight: 500,
          }}
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportModal;
