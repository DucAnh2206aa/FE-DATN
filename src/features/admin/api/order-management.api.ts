import { httpClient } from '@/shared/api/httpClient'
import { extractApiData, toApiClientError } from '@/shared/api/response'
import type { ApiSuccess } from '@/shared/types/api.types'

import type {
<<<<<<< HEAD
=======
  AdminCancelRefundRequest,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  AdminOrderItem,
  AdminOrderItemSnapshot,
  AdminOrdersResponse,
  AdminOrderStatus,
  AdminOrderStatusHistoryItem,
<<<<<<< HEAD
  ListAdminOrdersParams,
=======
  AdminOrderUser,
  AdminReturnRequest,
  AdminReturnRequestItem,
  AdminReturnRequestStatus,
  AdminRefundMethod,
  AdminUserRole,
  ListAdminOrdersParams,
  UpdateAdminCancelRefundRequestPayload,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  UpdateAdminOrderStatusPayload,
} from '../model/order-management.types'

const toId = (value: unknown) => {
  return typeof value === 'string' ? value : String(value ?? '')
}

const toRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  return value as Record<string, unknown>
}

<<<<<<< HEAD
const normalizeOrderStatus = (value: unknown): AdminOrderStatus => {
  return value === 'confirmed' ||
    value === 'preparing' ||
    value === 'shipping' ||
    value === 'delivered' ||
=======
const toStringArray = (value: unknown): string[] => {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : []
}

const normalizeOrderStatus = (value: unknown): AdminOrderStatus => {
  return value === 'confirmed' ||
    value === 'shipping' ||
    value === 'delivered' ||
    value === 'completed' ||
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    value === 'cancelled' ||
    value === 'returned'
    ? value
    : 'pending'
}

<<<<<<< HEAD
=======
const normalizeUserRole = (value: unknown): AdminUserRole => {
  return value === 'admin' || value === 'staff' ? value : 'customer'
}

const normalizeOrderUser = (value: Record<string, unknown>): AdminOrderUser => {
  return {
    id: toId(value.id ?? value._id),
    fullName: typeof value.fullName === 'string' ? value.fullName : undefined,
    email: typeof value.email === 'string' ? value.email : undefined,
    role: normalizeUserRole(value.role),
  }
}

>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
const normalizeOrderSnapshot = (value: Record<string, unknown>): AdminOrderItemSnapshot => {
  return {
    productId: toId(value.productId),
    productName: String(value.productName ?? ''),
    variantId: toId(value.variantId),
    variantSku: String(value.variantSku ?? ''),
    variantColor: String(value.variantColor ?? ''),
    productImage: typeof value.productImage === 'string' ? value.productImage : undefined,
    quantity: Number(value.quantity ?? 0),
    price: Number(value.price ?? 0),
    total: Number(value.total ?? 0),
  }
}

<<<<<<< HEAD
=======
const normalizeReturnStatus = (value: unknown): AdminReturnRequestStatus => {
  return value === 'approved' || value === 'rejected' || value === 'refunded' ? value : 'pending'
}

const normalizeRefundMethod = (value: unknown): AdminRefundMethod => {
  return value === 'wallet' ? value : 'bank_transfer'
}

const normalizeReturnItem = (value: Record<string, unknown>): AdminReturnRequestItem => {
  return {
    productId: toId(value.productId),
    productName: String(value.productName ?? ''),
    variantId: toId(value.variantId),
    variantSku: String(value.variantSku ?? ''),
    quantity: Number(value.quantity ?? 0),
    price: Number(value.price ?? 0),
    total: Number(value.total ?? 0),
  }
}

const normalizeReturnRequest = (value: Record<string, unknown>): AdminReturnRequest => {
  const rawItems = Array.isArray(value.items) ? value.items : []

  return {
    id: toId(value.id ?? value._id),
    requestedBy: toId(value.requestedBy),
    status: normalizeReturnStatus(value.status),
    refundMethod: normalizeRefundMethod(value.refundMethod),
    refundAmount: Number(value.refundAmount ?? 0),
    reason: typeof value.reason === 'string' ? value.reason : undefined,
    note: typeof value.note === 'string' ? value.note : undefined,
    refundEvidenceImages: toStringArray(value.refundEvidenceImages),
    items: rawItems
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => normalizeReturnItem(item)),
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  }
}

const normalizeCancelRefundRequest = (value: Record<string, unknown>): AdminCancelRefundRequest => {
  return {
    requestedBy: toId(value.requestedBy),
    status:
      value.status === 'rejected' || value.status === 'refunded' ? value.status : 'pending',
    refundAmount: Number(value.refundAmount ?? 0),
    bankCode: String(value.bankCode ?? ''),
    bankName: String(value.bankName ?? ''),
    accountNumber: String(value.accountNumber ?? ''),
    accountHolder: String(value.accountHolder ?? ''),
    note: typeof value.note === 'string' ? value.note : undefined,
    adminNote: typeof value.adminNote === 'string' ? value.adminNote : undefined,
    refundEvidenceImages: toStringArray(value.refundEvidenceImages),
    requestedAt: String(value.requestedAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
    processedAt: typeof value.processedAt === 'string' ? value.processedAt : undefined,
    processedBy: value.processedBy ? toId(value.processedBy) : undefined,
  }
}

>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
const normalizeOrderStatusHistory = (
  value: Record<string, unknown>
): AdminOrderStatusHistoryItem => {
  return {
    status: normalizeOrderStatus(value.status),
    changedBy: toId(value.changedBy),
    note: typeof value.note === 'string' ? value.note : undefined,
    changedAt: String(value.changedAt ?? ''),
  }
}

const normalizeOrder = (value: Record<string, unknown>): AdminOrderItem => {
  const rawItems = Array.isArray(value.items) ? value.items : []
  const rawStatusHistory = Array.isArray(value.statusHistory) ? value.statusHistory : []
<<<<<<< HEAD
=======
  const rawReturnRequests = Array.isArray(value.returnRequests) ? value.returnRequests : []
  const rawCancelRefundRequest = toRecord(value.cancelRefundRequest)
  const rawUser = toRecord(value.user)
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf

  return {
    id: toId(value.id ?? value._id),
    orderCode: String(value.orderCode ?? ''),
    userId: toId(value.userId),
<<<<<<< HEAD
=======
    user: rawUser ? normalizeOrderUser(rawUser) : undefined,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    shippingRecipientName: String(value.shippingRecipientName ?? ''),
    shippingPhone: String(value.shippingPhone ?? ''),
    shippingAddress: String(value.shippingAddress ?? ''),
    subtotal: Number(value.subtotal ?? 0),
    shippingFee: Number(value.shippingFee ?? 0),
    discountAmount: Number(value.discountAmount ?? 0),
    totalAmount: Number(value.totalAmount ?? 0),
    paymentMethod:
      value.paymentMethod === 'banking' ||
      value.paymentMethod === 'momo' ||
<<<<<<< HEAD
      value.paymentMethod === 'vnpay'
=======
      value.paymentMethod === 'vnpay' ||
      value.paymentMethod === 'zalopay'
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
        ? value.paymentMethod
        : 'cod',
    paymentStatus:
      value.paymentStatus === 'paid' ||
      value.paymentStatus === 'failed' ||
      value.paymentStatus === 'refunded'
        ? value.paymentStatus
        : 'pending',
<<<<<<< HEAD
=======
    zalopayChannel:
      value.zalopayChannel === 'gateway' ||
      value.zalopayChannel === 'wallet' ||
      value.zalopayChannel === 'bank_card' ||
      value.zalopayChannel === 'atm'
        ? value.zalopayChannel
        : undefined,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    voucherId: value.voucherId ? toId(value.voucherId) : undefined,
    status: normalizeOrderStatus(value.status),
    items: rawItems
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => normalizeOrderSnapshot(item)),
    statusHistory: rawStatusHistory
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => normalizeOrderStatusHistory(item)),
<<<<<<< HEAD
=======
    returnRequests: rawReturnRequests
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => normalizeReturnRequest(item)),
    cancelRefundRequest: rawCancelRefundRequest
      ? normalizeCancelRefundRequest(rawCancelRefundRequest)
      : undefined,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  }
}

const normalizeOrdersResponse = (value: Record<string, unknown>): AdminOrdersResponse => {
  const rawItems = Array.isArray(value.items) ? value.items : []

  return {
    items: rawItems
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => normalizeOrder(item)),
    page: Number(value.page ?? 1),
    limit: Number(value.limit ?? 20),
    totalItems: Number(value.totalItems ?? 0),
    totalPages: Number(value.totalPages ?? 1),
  }
}

export const listAdminOrders = async (
  params: ListAdminOrdersParams = {}
): Promise<AdminOrdersResponse> => {
  try {
    const response = await httpClient.get<ApiSuccess<Record<string, unknown>>>('/orders/admin/all', {
      params,
    })

    return normalizeOrdersResponse(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const updateAdminOrderStatus = async (
  orderId: string,
  payload: UpdateAdminOrderStatusPayload
): Promise<AdminOrderItem> => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/orders/${orderId}/status`,
      payload
    )

    return normalizeOrder(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}
<<<<<<< HEAD
=======

export const updateAdminReturnRequest = async (
  orderId: string,
  returnRequestId: string,
  payload: {
    status: AdminReturnRequestStatus
    refundMethod?: AdminRefundMethod
    note?: string
    refundEvidenceImages?: string[]
  }
): Promise<AdminOrderItem> => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/orders/${orderId}/return/${returnRequestId}`,
      payload
    )

    return normalizeOrder(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const updateAdminCancelRefundRequest = async (
  orderId: string,
  payload: UpdateAdminCancelRefundRequestPayload
): Promise<AdminOrderItem> => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/orders/${orderId}/cancel-refund`,
      payload
    )

    return normalizeOrder(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
