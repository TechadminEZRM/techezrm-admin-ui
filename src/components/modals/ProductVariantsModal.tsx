'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  TextField,
  Switch,
  FormControlLabel,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import {
  productVariantService,
  ProductVariant,
  CreateProductVariantRequest,
  UpdateProductVariantRequest,
} from '@/api/services/productVariants';
import EditProductModal from './EditProductModal';

interface ProductVariantsModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  productData?: {
    _id: string;
    uniqueId: string;
    name: string;
    description?: string;
    price: number;
    category?: string;
    inStock: boolean;
    images?: string[];
    bannerImage?: string;
    status: string;
    moq?: number;
    unit?: string;
    tags?: string[];
    appearance?: string;
  };
}

interface EditingVariant {
  id: string;
  data: Partial<UpdateProductVariantRequest>;
}

export default function ProductVariantsModal({
  open,
  onClose,
  productId,
  productName,
  productData,
}: ProductVariantsModalProps) {
  const queryClient = useQueryClient();
  const [editingVariant, setEditingVariant] = useState<EditingVariant | null>(
    null
  );
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [newVariant, setNewVariant] = useState<CreateProductVariantRequest>({
    productId,
    price: 0,
    unit: '',
    unitSize: 0,
    isActive: true,
  });

  // Unit options for dropdown
  const unitOptions = [
    'kg',
    'g',
    'lb',
    'oz',
    'L',
    'ml',
    'gal',
    'qt',
    'pt',
    'fl oz',
    'piece',
    'pack',
    'box',
    'bottle',
    'can',
    'jar',
    'tube',
    'sachet',
    'tablet',
    'capsule',
  ];

  // Fetch variants
  const {
    data: variantsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['productVariants', productId],
    queryFn: () => productVariantService.getVariantsByProductId(productId),
    enabled: open && !!productId,
  });

  // Create variant mutation
  const createVariantMutation = useMutation({
    mutationFn: (data: CreateProductVariantRequest) =>
      productVariantService.createProductVariant(data),
    onSuccess: () => {
      toast.success('Product variant created successfully!');
      queryClient.invalidateQueries({
        queryKey: ['productVariants', productId],
      });
      setIsAddingNew(false);
      setNewVariant({
        productId,
        price: 0,
        unit: '',
        unitSize: 0,
        isActive: true,
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create product variant');
    },
  });

  // Update variant mutation
  const updateVariantMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateProductVariantRequest;
    }) => productVariantService.updateProductVariant(id, data),
    onSuccess: () => {
      toast.success('Product variant updated successfully!');
      queryClient.invalidateQueries({
        queryKey: ['productVariants', productId],
      });
      setEditingVariant(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product variant');
    },
  });

  // Delete variant mutation
  const deleteVariantMutation = useMutation({
    mutationFn: (id: string) => productVariantService.deleteProductVariant(id),
    onSuccess: () => {
      toast.success('Product variant deleted successfully!');
      queryClient.invalidateQueries({
        queryKey: ['productVariants', productId],
      });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product variant');
    },
  });

  const variants = variantsData?.data || [];

  const handleEdit = (variant: ProductVariant) => {
    setEditingVariant({
      id: variant._id,
      data: {
        price: variant.price,
        unit: variant.unit,
        unitSize: variant.unitSize,
        isActive: variant.isActive,
      },
    });
  };

  const handleSaveEdit = () => {
    if (editingVariant) {
      updateVariantMutation.mutate({
        id: editingVariant.id,
        data: editingVariant.data,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingVariant(null);
  };

  const handleDelete = (variantId: string) => {
    if (window.confirm('Are you sure you want to delete this variant?')) {
      deleteVariantMutation.mutate(variantId);
    }
  };

  const handleAddNew = () => {
    setIsAddingNew(true);
  };

  const handleSaveNew = () => {
    if (newVariant.price > 0 && newVariant.unit && newVariant.unitSize > 0) {
      createVariantMutation.mutate(newVariant);
    } else {
      toast.error('Please fill in all required fields');
    }
  };

  const handleCancelNew = () => {
    setIsAddingNew(false);
    setNewVariant({
      productId,
      price: 0,
      unit: '',
      unitSize: 0,
      isActive: true,
    });
  };

  const handleClose = () => {
    setEditingVariant(null);
    setIsAddingNew(false);
    setNewVariant({
      productId,
      price: 0,
      unit: '',
      unitSize: 0,
      isActive: true,
    });
    onClose();
  };

  const handleEditProduct = () => {
    setEditProductModalOpen(true);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '70vh',
        },
      }}
      sx={{
        '& .MuiDialog-paper': {
          zIndex: 1300,
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          pb: 2,
          pt: 3,
          px: 3,
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#1F2A44',
              mb: 0.5,
              fontSize: '1.5rem',
            }}
          >
            Product Variants
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: '#666',
              fontSize: '0.95rem',
              fontWeight: 500,
            }}
          >
            {productName}
          </Typography>
          {productData?.uniqueId && (
            <Typography
              variant="caption"
              sx={{
                color: '#999',
                fontSize: '0.8rem',
                display: 'block',
                mt: 0.5,
              }}
            >
              ID: {productData.uniqueId}
            </Typography>
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {productData && (
            <Button
              variant="contained"
              size="medium"
              startIcon={<EditIcon />}
              onClick={handleEditProduct}
              sx={{
                backgroundColor: '#ff9800',
                color: 'white',
                fontWeight: 600,
                textTransform: 'none',
                px: 2,
                py: 1,
                borderRadius: 2,
                boxShadow: '0 2px 4px rgba(255, 152, 0, 0.2)',
                '&:hover': {
                  backgroundColor: '#f57c00',
                  boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Edit Product
            </Button>
          )}
          <IconButton
            onClick={handleClose}
            size="medium"
            sx={{
              backgroundColor: '#f5f5f5',
              '&:hover': {
                backgroundColor: '#e0e0e0',
              },
              transition: 'background-color 0.2s ease-in-out',
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#ffffff' }}>
        {isLoading && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              p: 6,
              backgroundColor: '#fafafa',
            }}
          >
            <Box sx={{ textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ mb: 2 }} />
              <Typography variant="body2" color="textSecondary">
                Loading product variants...
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Box sx={{ p: 3 }}>
            <Alert
              severity="error"
              sx={{
                borderRadius: 2,
                '& .MuiAlert-message': {
                  fontSize: '0.95rem',
                },
              }}
            >
              Failed to load product variants. Please try again.
            </Alert>
          </Box>
        )}

        {!isLoading && !error && (
          <Box sx={{ p: 3 }}>
            {/* Header Section */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                pb: 2,
                borderBottom: '1px solid #f0f0f0',
              }}
            >
              <Box>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 'bold',
                    color: '#1F2A44',
                    mb: 0.5,
                  }}
                >
                  Product Variants
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Manage different variants of this product
                </Typography>
              </Box>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddNew}
                disabled={isAddingNew}
                sx={{
                  backgroundColor: '#1976d2',
                  color: 'white',
                  fontWeight: 600,
                  textTransform: 'none',
                  px: 3,
                  py: 1,
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(25, 118, 210, 0.2)',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                    boxShadow: '0 4px 8px rgba(25, 118, 210, 0.3)',
                    transform: 'translateY(-1px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Add New Variant
              </Button>
            </Box>

            {/* Add New Variant Form */}
            {isAddingNew && (
              <Paper
                sx={{
                  p: 3,
                  mb: 3,
                  backgroundColor: '#f8f9fa',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    mb: 3,
                    fontWeight: 'bold',
                    color: '#1F2A44',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <AddIcon sx={{ fontSize: '1.2rem' }} />
                  Add New Variant
                </Typography>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr',
                      sm: '1fr 1fr',
                      md: '1fr 1fr 1fr 1fr auto',
                    },
                    gap: 2,
                    alignItems: 'end',
                  }}
                >
                  <TextField
                    label="Price"
                    type="number"
                    value={newVariant.price}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    size="small"
                    required
                  />
                  <FormControl size="small" required>
                    <InputLabel id="new-variant-unit-label">Unit</InputLabel>
                    <Select
                      labelId="new-variant-unit-label"
                      value={newVariant.unit}
                      onChange={(e) =>
                        setNewVariant({ ...newVariant, unit: e.target.value })
                      }
                      label="Unit"
                      MenuProps={{
                        disablePortal: false,
                        PaperProps: {
                          style: {
                            maxHeight: 300,
                            zIndex: 1500,
                          },
                        },
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                      }}
                    >
                      {unitOptions.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {unit}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Unit Size"
                    type="number"
                    value={newVariant.unitSize}
                    onChange={(e) =>
                      setNewVariant({
                        ...newVariant,
                        unitSize: parseFloat(e.target.value) || 0,
                      })
                    }
                    size="small"
                    required
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={newVariant.isActive}
                        onChange={(e) =>
                          setNewVariant({
                            ...newVariant,
                            isActive: e.target.checked,
                          })
                        }
                        sx={{
                          '& .MuiSwitch-switchBase': {
                            '&.Mui-checked': {
                              color: '#4caf50',
                              '& + .MuiSwitch-track': {
                                backgroundColor: '#4caf50',
                              },
                            },
                          },
                        }}
                      />
                    }
                    label="Active"
                    sx={{ margin: 0 }}
                  />
                  <Box
                    sx={{
                      display: 'flex',
                      gap: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Tooltip title="Save Variant">
                      <IconButton
                        onClick={handleSaveNew}
                        disabled={createVariantMutation.isPending}
                        sx={{
                          backgroundColor: '#4caf50',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#45a049',
                          },
                          '&:disabled': {
                            backgroundColor: '#e0e0e0',
                            color: '#999',
                          },
                        }}
                        size="small"
                      >
                        {createVariantMutation.isPending ? (
                          <CircularProgress size={16} color="inherit" />
                        ) : (
                          <SaveIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Cancel">
                      <IconButton
                        onClick={handleCancelNew}
                        size="small"
                        sx={{
                          backgroundColor: '#f44336',
                          color: 'white',
                          '&:hover': {
                            backgroundColor: '#d32f2f',
                          },
                        }}
                      >
                        <CancelIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
              </Paper>
            )}

            {/* Variants Table */}
            <TableContainer
              component={Paper}
              sx={{
                maxHeight: 500,
                borderRadius: 2,
                border: '1px solid #e0e0e0',
                boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              }}
            >
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        color: '#1F2A44',
                        fontSize: '0.9rem',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      Price
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        color: '#1F2A44',
                        fontSize: '0.9rem',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      Unit
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        color: '#1F2A44',
                        fontSize: '0.9rem',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      Unit Size
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        color: '#1F2A44',
                        fontSize: '0.9rem',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      Status
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        color: '#1F2A44',
                        fontSize: '0.9rem',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      ID & Created
                    </TableCell>
                    <TableCell
                      sx={{
                        fontWeight: 'bold',
                        backgroundColor: '#f8f9fa',
                        color: '#1F2A44',
                        fontSize: '0.9rem',
                        textAlign: 'center',
                        borderBottom: '2px solid #e0e0e0',
                      }}
                    >
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {variants.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        sx={{
                          textAlign: 'center',
                          py: 6,
                          backgroundColor: '#fafafa',
                        }}
                      >
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 2,
                          }}
                        >
                          <Typography
                            variant="h6"
                            color="textSecondary"
                            sx={{ fontWeight: 500 }}
                          >
                            No variants found
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Click "Add New Variant" to create the first variant
                            for this product
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ) : (
                    variants.map((variant) => (
                      <TableRow
                        key={variant._id}
                        hover
                        sx={{
                          '&:hover': {
                            backgroundColor: '#f8f9fa',
                          },
                          '&:nth-of-type(even)': {
                            backgroundColor: '#fafafa',
                          },
                          '&:nth-of-type(even):hover': {
                            backgroundColor: '#f0f0f0',
                          },
                        }}
                      >
                        <TableCell>
                          {editingVariant?.id === variant._id ? (
                            <TextField
                              type="number"
                              value={editingVariant.data.price || 0}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  data: {
                                    ...editingVariant.data,
                                    price: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                              size="small"
                              sx={{ width: 100 }}
                            />
                          ) : (
                            `$${variant.price}`
                          )}
                        </TableCell>
                        <TableCell>
                          {editingVariant?.id === variant._id ? (
                            <FormControl size="small" sx={{ width: 100 }}>
                              <Select
                                value={editingVariant.data.unit || ''}
                                onChange={(e) =>
                                  setEditingVariant({
                                    ...editingVariant,
                                    data: {
                                      ...editingVariant.data,
                                      unit: e.target.value,
                                    },
                                  })
                                }
                                MenuProps={{
                                  disablePortal: false,
                                  PaperProps: {
                                    style: {
                                      maxHeight: 300,
                                      zIndex: 1500,
                                    },
                                  },
                                  anchorOrigin: {
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                  },
                                  transformOrigin: {
                                    vertical: 'top',
                                    horizontal: 'left',
                                  },
                                }}
                              >
                                {unitOptions.map((unit) => (
                                  <MenuItem key={unit} value={unit}>
                                    {unit}
                                  </MenuItem>
                                ))}
                              </Select>
                            </FormControl>
                          ) : (
                            variant.unit
                          )}
                        </TableCell>
                        <TableCell>
                          {editingVariant?.id === variant._id ? (
                            <TextField
                              type="number"
                              value={editingVariant.data.unitSize || 0}
                              onChange={(e) =>
                                setEditingVariant({
                                  ...editingVariant,
                                  data: {
                                    ...editingVariant.data,
                                    unitSize: parseFloat(e.target.value) || 0,
                                  },
                                })
                              }
                              size="small"
                              sx={{ width: 100 }}
                            />
                          ) : (
                            variant.unitSize
                          )}
                        </TableCell>
                        <TableCell>
                          {editingVariant?.id === variant._id ? (
                            <Box
                              sx={{ display: 'flex', justifyContent: 'center' }}
                            >
                              <Switch
                                checked={editingVariant.data.isActive ?? true}
                                onChange={(e) =>
                                  setEditingVariant({
                                    ...editingVariant,
                                    data: {
                                      ...editingVariant.data,
                                      isActive: e.target.checked,
                                    },
                                  })
                                }
                                size="small"
                                sx={{
                                  '& .MuiSwitch-switchBase': {
                                    '&.Mui-checked': {
                                      color: '#4caf50',
                                      '& + .MuiSwitch-track': {
                                        backgroundColor: '#4caf50',
                                      },
                                    },
                                  },
                                }}
                              />
                            </Box>
                          ) : (
                            <Chip
                              label={variant.isActive ? 'Active' : 'Inactive'}
                              color={variant.isActive ? 'success' : 'default'}
                              size="small"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 'bold',
                                color: '#1976d2',
                                fontSize: '0.85rem',
                              }}
                            >
                              {variant.uniqueId}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="textSecondary"
                              sx={{ fontSize: '0.75rem' }}
                            >
                              {variant.createdAt
                                ? new Date(
                                    variant.createdAt
                                  ).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric',
                                  })
                                : 'N/A'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }}>
                          {editingVariant?.id === variant._id ? (
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1,
                                justifyContent: 'center',
                              }}
                            >
                              <Tooltip title="Save">
                                <IconButton
                                  onClick={handleSaveEdit}
                                  disabled={updateVariantMutation.isPending}
                                  color="primary"
                                  size="small"
                                >
                                  {updateVariantMutation.isPending ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <SaveIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Cancel">
                                <IconButton
                                  onClick={handleCancelEdit}
                                  size="small"
                                >
                                  <CancelIcon />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          ) : (
                            <Box
                              sx={{
                                display: 'flex',
                                gap: 1,
                                justifyContent: 'center',
                              }}
                            >
                              <Tooltip title="Edit">
                                <IconButton
                                  onClick={() => handleEdit(variant)}
                                  color="primary"
                                  size="small"
                                >
                                  <EditIcon />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton
                                  onClick={() => handleDelete(variant.uniqueId)}
                                  color="error"
                                  size="small"
                                  disabled={deleteVariantMutation.isPending}
                                >
                                  {deleteVariantMutation.isPending ? (
                                    <CircularProgress size={16} />
                                  ) : (
                                    <DeleteIcon />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Box>
          <Typography variant="body2" color="textSecondary">
            {variants.length} variant{variants.length !== 1 ? 's' : ''} found
          </Typography>
        </Box>
        <Button
          onClick={handleClose}
          variant="outlined"
          sx={{
            px: 3,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 600,
            borderColor: '#1976d2',
            color: '#1976d2',
            '&:hover': {
              borderColor: '#1565c0',
              backgroundColor: 'rgba(25, 118, 210, 0.04)',
            },
          }}
        >
          Close
        </Button>
      </DialogActions>

      {/* Edit Product Modal */}
      {productData && (
        <EditProductModal
          open={editProductModalOpen}
          onClose={() => setEditProductModalOpen(false)}
          product={productData}
        />
      )}
    </Dialog>
  );
}
