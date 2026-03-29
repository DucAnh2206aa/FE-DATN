import { createBrowserRouter, Navigate } from 'react-router-dom'

import { AccountLayout } from '@/layouts/AccountLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { PrivateLayout } from '@/layouts/PrivateLayout'
import { StorefrontLayout } from '@/layouts/StorefrontLayout'
import { AboutPage } from '@/pages/about/AboutPage'
import { AccountProfilePage } from '@/pages/account/AccountProfilePage'
import { AddressesPage } from '@/pages/account/AddressesPage'
import { ChangePasswordPage } from '@/pages/account/ChangePasswordPage'
import { MyOrdersPage } from '@/pages/account/MyOrdersPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import { DashboardCenterPage } from '@/pages/dashboard/DashboardCenterPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { MasterDataManagementPage } from '@/pages/dashboard/MasterDataManagementPage'
<<<<<<< HEAD
import { ProductCreatePage } from '@/pages/dashboard/ProductCreatePage'
import { ProductManagementPage } from '@/pages/dashboard/ProductManagementPage'
=======
import { OrderManagementPage } from '@/pages/dashboard/OrderManagementPage'
import { ProductCreatePage } from '@/pages/dashboard/ProductCreatePage'
import { ProductManagementPage } from '@/pages/dashboard/ProductManagementPage'
import { ReviewManagementPage } from '@/pages/dashboard/ReviewManagementPage'
import { SupportChatPage } from '@/pages/dashboard/SupportChatPage'
import { UserRoleManagementPage } from '@/pages/dashboard/UserRoleManagementPage'
import { VoucherManagementPage } from '@/pages/dashboard/VoucherManagementPage'
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
import { HomePage } from '@/pages/home/HomePage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { PaymentSuccessPage } from '@/pages/payment/PaymentSuccessPage'
import { ProductDetailPage } from '@/pages/product/ProductDetailPage'
import { ProductsPage } from '@/pages/product/ProductsPage'
import { ROUTE_PATHS } from '@/shared/constants/routes'
import { PrivateRoute } from '@/shared/ui/PrivateRoute'
import { RequireAdmin } from '@/shared/ui/RequireAdmin'
import { RequireAuth } from '@/shared/ui/RequireAuth'

export const router = createBrowserRouter([
  {
    element: <StorefrontLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: ROUTE_PATHS.ABOUT,
        element: <AboutPage />,
      },
      {
        path: ROUTE_PATHS.PRODUCTS,
        element: <ProductsPage />,
      },
      {
        path: ROUTE_PATHS.PRODUCT_DETAIL,
        element: <ProductDetailPage />,
      },
      {
        path: ROUTE_PATHS.PAYMENT_SUCCESS,
        element: <PaymentSuccessPage />,
      },

      {
        path: ROUTE_PATHS.ACCOUNT,
        element: (
          <RequireAuth>
            <AccountLayout />
          </RequireAuth>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="profile" replace />,
          },
          {
            path: 'profile',
            element: <AccountProfilePage />,
          },
          {
            path: 'addresses',
            element: <AddressesPage />,
          },
          {
            path: 'orders',
            element: <MyOrdersPage />,
          },
          {
            path: 'change-password',
            element: <ChangePasswordPage />,
          },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      {
        path: ROUTE_PATHS.LOGIN,
        element: <LoginPage />,
      },
      {
        path: ROUTE_PATHS.REGISTER,
        element: <RegisterPage />,
      },
    ],
  },
  {
    path: ROUTE_PATHS.DASHBOARD,
    element: (
      <PrivateRoute>
        <PrivateLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="center" replace />,
      },
      {
        path: 'center',
        element: <DashboardCenterPage />,
      },
      {
        path: 'statistics',
        element: <DashboardPage />,
      },

      {
<<<<<<< HEAD
        path: 'products/create',
        element: (
          <RequireAdmin>
            <ProductCreatePage />
          </RequireAdmin>
        ),
=======
        path: 'orders',
        element: <OrderManagementPage />,
      },
      {
        path: 'support-chat',
        element: <SupportChatPage />,
      },
      {
        path: 'reviews',
        element: <ReviewManagementPage />,
      },
      {
        path: 'comments',
        element: <CommentManagementPage />,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
      },
      {
        path: 'products/create',
        element: (
          <RequireAdmin>
            <ProductCreatePage />
          </RequireAdmin>
        ),
      },
      {
        path: 'products',
        element: (
          <RequireAdmin>
            <ProductManagementPage />
          </RequireAdmin>
        ),
      },

      {
        path: 'master-data',
        element: (
          <RequireAdmin>
            <MasterDataManagementPage />
          </RequireAdmin>
        ),
      },
      {
        path: 'users',
        element: (
          <RequireAdmin>
            <Navigate to={ROUTE_PATHS.DASHBOARD_ACCOUNTS} replace />
          </RequireAdmin>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
])
