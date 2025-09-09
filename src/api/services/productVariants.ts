/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from '../config';

export interface ProductVariant {
  _id: string;
  uniqueId: string;
  productId: string;
  price: number;
  unit: string;
  unitSize: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface CreateProductVariantRequest {
  productId: string;
  price: number;
  unit: string;
  unitSize: number;
  isActive: boolean;
}

export interface UpdateProductVariantRequest {
  price?: number;
  unit?: string;
  unitSize?: number;
  isActive?: boolean;
}

export interface ProductVariantResponse {
  success: boolean;
  data?: ProductVariant;
  message?: string;
  error?: string;
}

export interface ProductVariantsListResponse {
  success: boolean;
  data?: ProductVariant[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  message?: string;
  error?: string;
}

class ProductVariantService {
  private baseUrl = '/private/product-variants';

  // Get variants by product ID
  async getVariantsByProductId(
    productId: string
  ): Promise<ProductVariantsListResponse> {
    try {
      const response = await api.get(`${this.baseUrl}/product/${productId}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to fetch product variants'
      );
    }
  }

  // Create a new product variant
  async createProductVariant(
    data: CreateProductVariantRequest
  ): Promise<ProductVariantResponse> {
    try {
      const response = await api.post(this.baseUrl, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to create product variant'
      );
    }
  }

  // Update a product variant
  async updateProductVariant(
    id: string,
    data: UpdateProductVariantRequest
  ): Promise<ProductVariantResponse> {
    try {
      const response = await api.put(`${this.baseUrl}/${id}`, data);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to update product variant'
      );
    }
  }

  // Delete a product variant
  async deleteProductVariant(id: string): Promise<ProductVariantResponse> {
    try {
      const response = await api.delete(`${this.baseUrl}/${id}`);
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 'Failed to delete product variant'
      );
    }
  }
}

export const productVariantService = new ProductVariantService();
