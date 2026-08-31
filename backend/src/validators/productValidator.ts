import { z } from 'zod';

const optionalObjectId = z.string().optional().or(z.literal('')).transform(val => (val === '' || !val ? undefined : val));

export const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  categoryId: optionalObjectId,
  description: z.string().optional(),
  sellingPrice: z.number().min(0, 'Selling price must be non-negative'),
  costPrice: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  currentStock: z.number().default(0),
  minimumStock: z.number().default(5),
  isService: z.boolean().default(false),
  productImage: z.string().optional(),
  modifiers: z.array(z.object({
    name: z.string(),
    price: z.number().min(0)
  })).optional().default([]),
  batchNumber: z.string().optional(),
  expiryDate: z.string().optional().or(z.literal('')).transform(val => (val === '' || !val ? undefined : val)),
  activeStatus: z.boolean().default(true)
});

export const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  colorCode: z.string().optional()
});
