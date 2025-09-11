import { api } from '../config';

export interface Category {
  _id: string;
  uniqueId: string;
  name: string;
  slug: string;
  description: string;
  parentCategory: string | null;
  status: string;
  tags: string[];
}

export interface Application {
  id: string;
  slug: string;
  name: string;
}

export interface Tag {
  id: string;
  slug: string;
  name: string;
}

export interface Function {
  id: string;
  slug: string;
  name: string;
}

export interface CountryOfOrigin {
  countryCode: string;
  phoneCode: string;
  name: string;
  currency: string;
  emoji: string;
  continent: string;
  isProducer: boolean;
}

export interface ProductFiltersData {
  category: {
    categories: Category[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
  application: Application[];
  tag: Tag[];
  function: Function[];
  countryOfOrigin: CountryOfOrigin[];
}

export interface ProductFiltersResponse {
  success: boolean;
  data: ProductFiltersData;
}

export const productFiltersService = {
  getFiltersData: async (): Promise<ProductFiltersResponse> => {
    const response = await api.get('/private/products/filters/data');
    return response.data;
  },
};
