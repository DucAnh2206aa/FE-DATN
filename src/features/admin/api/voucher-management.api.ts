import { httpClient } from '@/shared/api/httpClient'
import { extractApiData, toApiClientError } from '@/shared/api/response'
import type { ApiSuccess } from '@/shared/types/api.types'

import type {
  AdminVoucherItem,
  AdminVoucherListResponse,
  CreateAdminVoucherPayload,
  ListAdminVouchersParams,
  UpdateAdminVoucherPayload,
  VoucherDiscountType,
} from '../model/voucher-management.types'

const toId = (value: unknown) => {
  return typeof value === 'string' ? value : String(value ?? '')
}

const toRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  return value as Record<string, unknown>
}

const normalizeDiscountType = (value: unknown): VoucherDiscountType => {
  return value === 'fixed_amount' ? 'fixed_amount' : 'percentage'
}

const normalizeVoucher = (value: Record<string, unknown>): AdminVoucherItem => {
  const usageLimit = Number(value.usageLimit ?? 0)
  const normalizedMaxUsagePerUserRaw = Number(value.maxUsagePerUser)
  const maxUsagePerUser = Number.isFinite(normalizedMaxUsagePerUserRaw)
    ? normalizedMaxUsagePerUserRaw
    : Math.max(1, usageLimit - 1)

  return {
    id: toId(value.id ?? value._id),
    code: String(value.code ?? ''),
    description: typeof value.description === 'string' ? value.description : undefined,
    discountType: normalizeDiscountType(value.discountType),
    discountValue: Number(value.discountValue ?? 0),
    minOrderValue: Number(value.minOrderValue ?? 0),
    maxDiscountAmount:
      typeof value.maxDiscountAmount === 'number' ? value.maxDiscountAmount : undefined,
    startDate: String(value.startDate ?? ''),
    expirationDate: String(value.expirationDate ?? ''),
    usageLimit,
    maxUsagePerUser,
    usedCount: Number(value.usedCount ?? 0),
    isActive: typeof value.isActive === 'boolean' ? value.isActive : true,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  }
}

const normalizePaginated = (value: Record<string, unknown>): AdminVoucherListResponse => {
  const rawItems = Array.isArray(value.items) ? value.items : []

  return {
    items: rawItems
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => normalizeVoucher(item)),
    page: Number(value.page ?? 1),
    limit: Number(value.limit ?? 20),
    totalItems: Number(value.totalItems ?? 0),
    totalPages: Number(value.totalPages ?? 1),
  }
}

export const listAdminVouchers = async (
  params: ListAdminVouchersParams = {}
): Promise<AdminVoucherListResponse> => {
  try {
    const response = await httpClient.get<ApiSuccess<Record<string, unknown>>>('/vouchers', {
      params,
    })

    return normalizePaginated(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const createAdminVoucher = async (
  payload: CreateAdminVoucherPayload
): Promise<AdminVoucherItem> => {
  try {
    const response = await httpClient.post<ApiSuccess<Record<string, unknown>>>(
      '/vouchers',
      payload
    )
    return normalizeVoucher(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const updateAdminVoucher = async (
  voucherId: string,
  payload: UpdateAdminVoucherPayload
): Promise<AdminVoucherItem> => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/vouchers/${voucherId}`,
      payload
    )
    return normalizeVoucher(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const deleteAdminVoucher = async (voucherId: string) => {
  try {
    await httpClient.delete<ApiSuccess<Record<string, unknown>>>(`/vouchers/${voucherId}`)
  } catch (error) {
    throw toApiClientError(error)
  }
}
