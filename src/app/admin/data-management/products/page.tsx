'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Avatar,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/api/services/products';
import { useCategories } from '@/hooks/useCategories';
import {
  TableComponent,
  TableRowData,
} from '../../../../components/TableComponent';
import { TableFilter } from '@/components';
import { toast } from 'react-toastify';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import VariantsIcon from '@mui/icons-material/ViewList';
import Image from 'next/image';
import ProductVariantsModal from '../../../../components/modals/ProductVariantsModal';
import EditProductModal from '../../../../components/modals/EditProductModal';
import ProductDetailsModal from '../../../../components/modals/ProductDetailsModal';
import ExportModal from '../../../../components/modals/ExportModal';
import {
  exportToPDF,
  exportToExcel,
  exportToCSV,
  getAllProductsForExport,
} from '../../../../utils/exportUtils';

interface ProductRowData extends TableRowData {
  id: string;
  name: string;
  image: React.ReactNode;
  category: string;
  price: string;
  status: string;
  inStock: string;
  actions: React.ReactNode;
}

export default function ProductsListing() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [variantsModalOpen, setVariantsModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [productDetailsModalOpen, setProductDetailsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<{
    id: string;
    name: string;
    data?: any;
  } | null>(null);
  const [productToEdit, setProductToEdit] = useState<any>(null);
  const [productToView, setProductToView] = useState<string | null>(null);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const renderImage = (imageUrl: string) => {
    if (!imageUrl) {
      return (
        <Avatar sx={{ width: 40, height: 40, bgcolor: '#f0f0f0' }}>
          <ImageIcon sx={{ color: '#999' }} />
        </Avatar>
      );
    }

    return (
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 1,
          overflow: 'hidden',
          cursor: 'pointer',
          border: '1px solid #e0e0e0',
          '&:hover': {
            transform: 'scale(1.05)',
            transition: 'transform 0.2s',
          },
        }}
        onClick={(e) => handleImageClick(imageUrl, e)}
      >
        <Image
          src={imageUrl}
          alt="Product"
          width={40}
          height={40}
          style={{ objectFit: 'cover', width: '100%', height: '100%' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.setAttribute('style', 'display: block');
          }}
        />
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: '#f0f0f0',
            display: 'none',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        >
          <ImageIcon sx={{ color: '#999' }} />
        </Avatar>
      </Box>
    );
  };

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch categories
  const { data: categoriesData } = useCategories();

  // Fetch products
  const {
    data: productsData,
    isLoading,
    error,
  } = useQuery({
    queryKey: [
      'products',
      {
        page,
        search: debouncedSearchTerm,
        category: categoryFilter?.value,
        status: statusFilter?.value,
      },
    ],
    queryFn: () =>
      productService.getProducts({
        page,
        search: debouncedSearchTerm,
        category: categoryFilter?.value || '',
        status: statusFilter?.value || '',
      }),
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      return productService.deleteProduct(productId);
    },
    onSuccess: () => {
      toast.success('Product deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setDeleteDialogOpen(false);
      setProductToDelete(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });

  const products = productsData?.products || [];
  const totalResults = productsData?.pagination?.total || 0;

  const renderActions = (productId: string, productName: string) => (
    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleViewProduct(productId);
        }}
        sx={{ color: '#1976d2' }}
        title="View Product"
      >
        <VisibilityIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleViewVariants(productId, productName);
        }}
        sx={{ color: '#9c27b0' }}
        title="View Variants"
      >
        <VariantsIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleEditProduct(productId);
        }}
        sx={{ color: '#ff9800' }}
        title="Edit Product"
      >
        <EditIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          handleDeleteProduct(productId);
        }}
        sx={{ color: '#f44336' }}
        title="Delete Product"
      >
        <DeleteIcon fontSize="small" />
      </IconButton>
    </Box>
  );

  const productData: ProductRowData[] = products.map((product: any) => ({
    id: product._id,
    name: product.name,
    image: renderImage(product.bannerImage || product.images?.[0] || ''),
    category: product?.category?.name || 'N/A',
    price: `$${product.price || 0}`,
    status: product.status || 'inactive',
    inStock: product.inStock ? 'Yes' : 'No',
    actions: renderActions(product?._id, product.name),
  }));

  const columns = [
    { id: 'image', label: 'Image', width: '10%', align: 'center' as const },
    { id: 'name', label: 'Product Name', width: '20%' },
    { id: 'category', label: 'Category', width: '15%' },
    { id: 'price', label: 'Price', width: '12%', align: 'center' as const },
    {
      id: 'status',
      label: 'Status',
      width: '12%',
      type: 'status' as const,
      align: 'center' as const,
    },
    {
      id: 'inStock',
      label: 'In Stock',
      width: '12%',
      align: 'center' as const,
    },
    { id: 'actions', label: 'Actions', width: '25%', align: 'center' as const },
  ];

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleRowClick = (row: TableRowData) => {
    const productRow = row as ProductRowData;
    // router.push(`/admin/data-management/products/${productRow.id}`);
  };

  const handleAddProduct = () => {
    router.push('/admin/inventory/add-product');
  };

  const handleEditProduct = (productId: string) => {
    const product = products.find((p: any) => p._id === productId);
    if (product) {
      setProductToEdit(product);
      setEditProductModalOpen(true);
    }
  };

  const handleViewProduct = (productId: string) => {
    setProductToView(productId);
    setProductDetailsModalOpen(true);
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setDeleteDialogOpen(true);
  };

  const handleViewVariants = (productId: string, productName: string) => {
    const product = products.find((p: any) => p._id === productId);
    setSelectedProduct({
      id: productId,
      name: productName,
      data: product,
    });
    setVariantsModalOpen(true);
  };

  const handleImageClick = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (imageUrl) {
      setSelectedImage(imageUrl);
      setImageModalOpen(true);
    }
  };

  const confirmDelete = () => {
    if (productToDelete) {
      deleteProductMutation.mutate(productToDelete);
    }
  };

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  // Create category options from API data
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    ...(categoriesData?.categories?.map((category: any) => ({
      value: category.id || category._id,
      label: category.name,
    })) || []),
  ];

  // Reset filters handler
  const handleResetFilters = () => {
    setSearchTerm('');
    setCategoryFilter(null);
    setStatusFilter(null);
  };

  // Export handler
  const handleExport = async (format: 'pdf' | 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Fetch all products for export
      const allProducts = await getAllProductsForExport(productService);

      if (format === 'pdf') {
        await exportToPDF(allProducts, 'products');
        toast.success('Products exported to PDF successfully!');
      } else if (format === 'excel') {
        await exportToExcel(allProducts, 'products');
        toast.success('Products exported to Excel successfully!');
      } else if (format === 'csv') {
        await exportToCSV(allProducts, 'products');
        toast.success('Products exported to CSV successfully!');
      }

      setExportModalOpen(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to export products');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        backgroundColor: '#F9FAFB',
        minHeight: '85vh',
        fontFamily: 'Poppins, sans-serif',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography
          sx={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#1F2A44',
            fontFamily: 'Poppins, sans-serif',
          }}
        >
          Products Listing ({totalResults})
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddProduct}
          sx={{
            fontWeight: 600,
            textTransform: 'none',
            backgroundColor: '#1976d2',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Add Product
        </Button>
      </Box>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load products. Please try again.
        </Alert>
      )}

      {/* Filters */}
      {!isLoading && !error && (
        <TableFilter
          search={[
            {
              key: 'search',
              label: 'Search Products',
              placeholder: 'Search by name, ID, or category...',
              value: searchTerm,
              handleChange: setSearchTerm,
            },
          ]}
          dropDowns={[
            {
              key: 'category',
              placeholder: 'All Categories',
              options: categoryOptions,
              value: categoryFilter,
              handleChange: setCategoryFilter,
            },
            {
              key: 'status',
              placeholder: 'All Status',
              options: statusOptions,
              value: statusFilter,
              handleChange: setStatusFilter,
            },
          ]}
          buttons={[
            {
              key: 'export',
              label: 'Export',
              onClick: () => setExportModalOpen(true),
              backgroundColor: '#06A561',
              hoverBackgroundColor: '#059669',
            },
          ]}
          onReset={handleResetFilters}
        />
      )}

      {!isLoading && !error && (
        <TableComponent
          columns={columns}
          data={productData}
          totalResults={totalResults}
          currentPage={page}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          showCheckboxes={false}
          showHeader={true}
          rowsPerPage={10}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteProductMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={deleteProductMutation.isPending}
            startIcon={
              deleteProductMutation.isPending ? (
                <CircularProgress size={16} />
              ) : null
            }
          >
            {deleteProductMutation.isPending ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Image Modal */}
      <Dialog
        open={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            overflow: 'hidden',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            pb: 1,
          }}
        >
          <Typography variant="h6">Product Image</Typography>
          <IconButton onClick={() => setImageModalOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400,
              backgroundColor: '#f5f5f5',
            }}
          >
            {selectedImage ? (
              <Image
                src={selectedImage}
                alt="Product"
                width={600}
                height={400}
                style={{
                  objectFit: 'contain',
                  maxWidth: '100%',
                  maxHeight: '100%',
                }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  color: '#999',
                }}
              >
                <ImageIcon sx={{ fontSize: 64, mb: 2 }} />
                <Typography>No image available</Typography>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>

      {/* Product Variants Modal */}
      {selectedProduct && (
        <ProductVariantsModal
          open={variantsModalOpen}
          onClose={() => {
            setVariantsModalOpen(false);
            setSelectedProduct(null);
          }}
          productId={selectedProduct.id}
          productName={selectedProduct.name}
          productData={selectedProduct.data}
        />
      )}

      {/* Edit Product Modal */}
      {productToEdit && (
        <EditProductModal
          open={editProductModalOpen}
          onClose={() => {
            setEditProductModalOpen(false);
            setProductToEdit(null);
          }}
          product={productToEdit}
        />
      )}

      {/* Product Details Modal */}
      {productToView && (
        <ProductDetailsModal
          open={productDetailsModalOpen}
          onClose={() => {
            setProductDetailsModalOpen(false);
            setProductToView(null);
          }}
          productId={productToView}
        />
      )}

      {/* Export Modal */}
      <ExportModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        onExport={handleExport}
        isLoading={isExporting}
      />
    </Box>
  );
}
