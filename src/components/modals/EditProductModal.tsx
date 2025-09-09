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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  CircularProgress,
  Alert,
  Grid,
  InputAdornment,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Close as CloseIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  ViewList as ViewListIcon,
  Info as InfoIcon,
  Category as CategoryIcon,
} from '@mui/icons-material';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { productService } from '@/api/services/products';

interface EditProductModalProps {
  open: boolean;
  onClose: () => void;
  product: {
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

interface DietaryAttribute {
  title: string;
  logo: string;
  certificateLink: string;
}

export default function EditProductModal({
  open,
  onClose,
  product,
}: EditProductModalProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: 0,
    category: '',
    inStock: true,
    status: 'active',
    moq: 0,
    unit: '',
    appearance: '',
    tags: [] as string[],
    dietaryAttributes: [] as DietaryAttribute[],
  });
  const [tagInput, setTagInput] = useState('');

  // Unit options
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

  // Category options
  const categoryOptions = [
    'Sports Nutrition',
    'Bioactives',
    'Nootropics',
    'Amino Acids',
    'Vitamins',
    'Minerals',
    'Herbs',
    'Supplements',
  ];

  // Initialize form data when product changes
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        category: product.category || '',
        inStock: product.inStock ?? true,
        status: product.status || 'active',
        moq: product.moq || 0,
        unit: product.unit || '',
        appearance: product.appearance || '',
        tags: product.tags || [],
        dietaryAttributes: [],
      });
    }
  }, [product]);

  // Update product mutation
  const updateProductMutation = useMutation({
    mutationFn: (data: any) => productService.updateProduct(product._id, data),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update product');
    },
  });

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    if (formData.price <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    updateProductMutation.mutate(formData);
  };

  const handleClose = () => {
    setTagInput('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          minHeight: '80vh',
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 1,
          borderBottom: '1px solid #e0e0e0',
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontWeight: 'bold', color: '#1F2A44' }}
          >
            Edit Product
          </Typography>
          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
            {product?.uniqueId}
          </Typography>
        </Box>
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0, backgroundColor: '#ffffff' }}>
        <Box sx={{ p: 3 }}>
          <Grid container spacing={3}>
            {/* Column 1: Basic Information */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <CardContent>
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
                    <InfoIcon sx={{ fontSize: '1.2rem' }} />
                    Basic Information
                  </Typography>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <TextField
                      fullWidth
                      label="Product Name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange('name', e.target.value)
                      }
                      required
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Price"
                      type="number"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange(
                          'price',
                          parseFloat(e.target.value) || 0
                        )
                      }
                      required
                      size="small"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">$</InputAdornment>
                        ),
                      }}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={(e) =>
                        handleInputChange('description', e.target.value)
                      }
                      multiline
                      rows={4}
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={formData.category}
                        onChange={(e) =>
                          handleInputChange('category', e.target.value)
                        }
                        label="Category"
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        {categoryOptions.map((category) => (
                          <MenuItem key={category} value={category}>
                            {category}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Column 2: Product Details */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <CardContent>
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
                    <CategoryIcon sx={{ fontSize: '1.2rem' }} />
                    Product Details
                  </Typography>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
                  >
                    <FormControl fullWidth size="small">
                      <InputLabel>Unit</InputLabel>
                      <Select
                        value={formData.unit}
                        onChange={(e) =>
                          handleInputChange('unit', e.target.value)
                        }
                        label="Unit"
                        sx={{
                          borderRadius: 2,
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
                      fullWidth
                      label="Minimum Order Quantity (MOQ)"
                      type="number"
                      value={formData.moq}
                      onChange={(e) =>
                        handleInputChange('moq', parseInt(e.target.value) || 0)
                      }
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <TextField
                      fullWidth
                      label="Appearance"
                      value={formData.appearance}
                      onChange={(e) =>
                        handleInputChange('appearance', e.target.value)
                      }
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2,
                        },
                      }}
                    />

                    <FormControl fullWidth size="small">
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange('status', e.target.value)
                        }
                        label="Status"
                        sx={{
                          borderRadius: 2,
                        }}
                      >
                        <MenuItem value="active">Active</MenuItem>
                        <MenuItem value="inactive">Inactive</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            {/* Column 3: Status & Tags */}
            <Grid item xs={12} md={4}>
              <Card
                sx={{
                  height: '100%',
                  borderRadius: 2,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}
              >
                <CardContent>
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
                    <ViewListIcon sx={{ fontSize: '1.2rem' }} />
                    Status & Tags
                  </Typography>

                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}
                  >
                    {/* Stock Status */}
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontWeight: 600, mb: 1 }}
                      >
                        Stock Status
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={formData.inStock}
                            onChange={(e) =>
                              handleInputChange('inStock', e.target.checked)
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
                        label={formData.inStock ? 'In Stock' : 'Out of Stock'}
                        sx={{
                          margin: 0,
                          alignItems: 'center',
                          '& .MuiFormControlLabel-label': {
                            fontWeight: 500,
                            color: formData.inStock ? '#2e7d32' : '#d32f2f',
                          },
                        }}
                      />
                    </Box>

                    <Divider />

                    {/* Tags Section */}
                    <Box>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Product Tags
                      </Typography>

                      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                        <TextField
                          label="Add Tag"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                          size="small"
                          sx={{
                            flexGrow: 1,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Button
                          variant="contained"
                          onClick={handleAddTag}
                          disabled={!tagInput.trim()}
                          size="small"
                          sx={{
                            borderRadius: 2,
                            backgroundColor: '#1976d2',
                            '&:hover': { backgroundColor: '#1565c0' },
                            minWidth: 'auto',
                            px: 2,
                          }}
                        >
                          Add
                        </Button>
                      </Box>

                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 1,
                          minHeight: 40,
                        }}
                      >
                        {formData.tags.length === 0 ? (
                          <Typography
                            variant="caption"
                            color="textSecondary"
                            sx={{ alignSelf: 'center' }}
                          >
                            No tags added yet
                          </Typography>
                        ) : (
                          formData.tags.map((tag, index) => (
                            <Chip
                              key={index}
                              label={tag}
                              onDelete={() => handleRemoveTag(tag)}
                              size="small"
                              color="primary"
                              variant="outlined"
                              sx={{ borderRadius: 2 }}
                            />
                          ))
                        )}
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {updateProductMutation.error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {updateProductMutation.error.message || 'Failed to update product'}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ p: 2, borderTop: '1px solid #e0e0e0' }}>
        <Button
          onClick={handleClose}
          variant="outlined"
          disabled={updateProductMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={updateProductMutation.isPending}
          startIcon={
            updateProductMutation.isPending ? (
              <CircularProgress size={16} />
            ) : (
              <SaveIcon />
            )
          }
          sx={{
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          {updateProductMutation.isPending ? 'Updating...' : 'Update Product'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
