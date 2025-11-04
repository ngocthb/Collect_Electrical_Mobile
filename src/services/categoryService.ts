import { SubCategory, Category, Attribute, SizeTier } from '../types/Category';
import axiosClient from '../config/axios';

export const getParentCategories = async (): Promise<Category[]> => {
  const res = (await axiosClient.get('/categories/parents')) as any;
  return res || [];
};

export const getSubcategories = async (
  parentCategoryId: string,
): Promise<SubCategory[]> => {
  const res = (await axiosClient.get(
    `/categories/${parentCategoryId}/subcategories`,
  )) as any;
  return res || [];
};

export const getSizeOptions = async (
  categoryId: string,
): Promise<SizeTier[]> => {
  const res = (await axiosClient.get(`/size-tier/${categoryId}`)) as any;
  return res || [];
};

export const getAttributes = async (
  categoryId: string,
): Promise<Attribute[]> => {
  const res = (await axiosClient.get(
    `/categories/${categoryId}/attributes`,
  )) as any;
  return res || [];
};
