import {
  SubCategory,
  Category,
  Attribute,
  SizeTier,
  AttributeOption,
} from '../types/Category';
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

export const searchSubCategories = async (
  parentId: string,
  searchQuery: string,
): Promise<SubCategory[]> => {
  const encodedQuery = encodeURIComponent(searchQuery);
  const res = await axiosClient.get(
    `/subCategory?parentId=${parentId}&name=${encodedQuery}`,
  );
  return res.data || [];
};

export const getAttributeOptions = async (
  attributeId: string,
): Promise<AttributeOption[]> => {
  const res = (await axiosClient.get(
    `/attribute-option/by-attribute/${attributeId}`,
  )) as AttributeOption[];
  return res || [];
};

export const getBrandsBySubcategory = async (
  subcategoryId: string,
): Promise<any[]> => {
  const res = (await axiosClient.get(
    `/brands/sub-category/${subcategoryId}`,
  )) as any;
  return res || [];
};
