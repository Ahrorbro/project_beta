/**
 * Common TypeScript types and interfaces used throughout the application
 */

export type UserRole = "SUPER_ADMIN" | "LANDLORD" | "TENANT";

export type PaymentStatus = "PENDING" | "PAID" | "OVERDUE";

export type MaintenanceStatus = "SUBMITTED" | "IN_PROGRESS" | "RESOLVED";

export type PropertyType = "APARTMENT" | "HOUSE" | "COMMERCIAL" | "OTHER";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface SearchParams extends PaginationParams {
  search?: string;
  filter?: string;
}

