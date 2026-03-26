// LETSPACE - Shared TypeScript Types

export type NavItem = {
  title: string;
  href: string;
  icon?: string;
  badge?: string | number;
  children?: NavItem[];
};

export type DashboardStats = {
  totalProperties: number;
  totalUnits: number;
  occupiedUnits: number;
  vacantUnits: number;
  occupancyRate: number;
  totalTenants: number;
  monthlyRevenue: number;
  pendingRent: number;
  overdueInvoices: number;
  openMaintenanceRequests: number;
  newLeadsThisMonth: number;
  collectionRate: number;
};

export type RevenueData = {
  month: string;
  revenue: number;
  expenses: number;
  netIncome: number;
};

export type OccupancyData = {
  propertyName: string;
  occupied: number;
  vacant: number;
  total: number;
  rate: number;
};

export type PlanFeature = {
  name: string;
  free: boolean | string;
  starter: boolean | string;
  professional: boolean | string;
  enterprise: boolean | string;
};

export type ApiResponse<T = unknown> = {
  data?: T;
  error?: string;
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};
