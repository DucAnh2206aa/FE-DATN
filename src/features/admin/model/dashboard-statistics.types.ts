import type { AdminOrderStatus, AdminPaymentMethod } from './order-management.types'

export interface DashboardSummary {
  totalOrders: number
  deliveredOrders: number
  processingOrders: number
  cancelledOrders: number
  grossRevenue: number
  deliveredRevenue: number
  averageDeliveredOrderValue: number
  totalItemsSold: number
  totalUsers: number
  customersCount: number
  staffCount: number
  adminCount: number
  activeUsers: number
  inactiveUsers: number
  totalProducts: number
  availableProducts: number
  outOfStockVariants: number
  lowStockVariants: number
  totalReviews: number
  totalComments: number
}

<<<<<<< HEAD
export interface DashboardDailyRevenueItem {
=======
  export interface DashboardDailyRevenueItem {
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  date: string
  revenue: number
  orders: number
  deliveredOrders: number
}

export interface DashboardTrends {
  days: number
  fromDate: string
  toDate: string
  dailyRevenue: DashboardDailyRevenueItem[]
}

export interface DashboardStatusBreakdownItem {
  status: AdminOrderStatus
  count: number
  revenue: number
}

export interface DashboardPaymentMethodBreakdownItem {
  paymentMethod: AdminPaymentMethod
  count: number
  revenue: number
}

<<<<<<< HEAD
export interface DashboardCategoryBreakdownItem {
  categoryId: string | null
  categoryName: string
  orders: number
  deliveredOrders: number
  items: number
  revenue: number
}

export interface DashboardBreakdowns {
  byStatus: DashboardStatusBreakdownItem[]
  byPaymentMethod: DashboardPaymentMethodBreakdownItem[]
  byCategory: DashboardCategoryBreakdownItem[]
=======
export interface DashboardBreakdowns {
  byStatus: DashboardStatusBreakdownItem[]
  byPaymentMethod: DashboardPaymentMethodBreakdownItem[]
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
}

export interface DashboardTopProductItem {
  productId: string
  name: string
  brand: string
  soldCount: number
  reviewCount: number
  averageRating: number
  isAvailable: boolean
  thumbnailUrl: string | null
}

export interface DashboardStatisticsResponse {
  summary: DashboardSummary
  trends: DashboardTrends
  breakdowns: DashboardBreakdowns
  topProducts: DashboardTopProductItem[]
<<<<<<< HEAD
  bottomProducts: DashboardTopProductItem[]
}
=======
}
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
