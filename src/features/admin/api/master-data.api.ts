import { httpClient } from '@/shared/api/httpClient'
import { extractApiData, toApiClientError } from '@/shared/api/response'
import type { ApiSuccess } from '@/shared/types/api.types'

import type {
  MasterBrandItem,
  MasterBrandListResponse,
  MasterCategoryItem,
  MasterCategoryListResponse,
  MasterColorItem,
  MasterColorListResponse,
  MasterListParams,
  MasterSizeItem,
  MasterSizeListResponse,
  UpsertBrandPayload,
  UpsertCategoryPayload,
  UpsertColorPayload,
  UpsertSizePayload,
} from '../model/master-data.types'

const REFERENCE_LIMIT = 100
const HIDDEN_BRAND_NAME = 'Không xác định'

const toId = (value: unknown) => {
  return typeof value === 'string' ? value : String(value ?? '')
}

const toRecord = (value: unknown): Record<string, unknown> | undefined => {
  if (!value || typeof value !== 'object') {
    return undefined
  }

  return value as Record<string, unknown>
}

const normalizeCategory = (value: Record<string, unknown>): MasterCategoryItem => {
  return {
    id: toId(value.id ?? value._id),
    name: String(value.name ?? ''),
    description: typeof value.description === 'string' ? value.description : undefined,
    isActive: typeof value.isActive === 'boolean' ? value.isActive : true,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  }
}

const normalizeBrand = (value: Record<string, unknown>): MasterBrandItem => {
  return {
    id: toId(value.id ?? value._id),
    name: String(value.name ?? ''),
    description: typeof value.description === 'string' ? value.description : undefined,
    isActive: typeof value.isActive === 'boolean' ? value.isActive : true,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  }
}

const normalizeColor = (value: Record<string, unknown>): MasterColorItem => {
  return {
    id: toId(value.id ?? value._id),
    name: String(value.name ?? ''),
    hexCode: typeof value.hexCode === 'string' ? value.hexCode : undefined,
    isActive: typeof value.isActive === 'boolean' ? value.isActive : true,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  }
}

const normalizeSize = (value: Record<string, unknown>): MasterSizeItem => {
  return {
    id: toId(value.id ?? value._id),
    name: String(value.name ?? ''),
    isActive: typeof value.isActive === 'boolean' ? value.isActive : true,
    createdAt: String(value.createdAt ?? ''),
    updatedAt: String(value.updatedAt ?? ''),
  }
}

const normalizePaginated = <T>(
  value: Record<string, unknown>,
  normalizeItem: (item: Record<string, unknown>) => T
) => {
  const rawItems = Array.isArray(value.items) ? value.items : []

  return {
    items: rawItems
      .map((item) => toRecord(item))
      .filter((item): item is Record<string, unknown> => Boolean(item))
      .map((item) => normalizeItem(item)),
    page: Number(value.page ?? 1),
    limit: Number(value.limit ?? 20),
    totalItems: Number(value.totalItems ?? 0),
    totalPages: Number(value.totalPages ?? 1),
  }
}

export const listMasterCategories = async (
  params: MasterListParams = {}
): Promise<MasterCategoryListResponse> => {
  try {
    const response = await httpClient.get<ApiSuccess<Record<string, unknown>>>('/categories', {
      params,
    })

    return normalizePaginated(extractApiData(response), normalizeCategory)
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const createMasterCategory = async (payload: UpsertCategoryPayload) => {
  try {
    const response = await httpClient.post<ApiSuccess<Record<string, unknown>>>('/categories', payload)
    return normalizeCategory(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const updateMasterCategory = async (categoryId: string, payload: Partial<UpsertCategoryPayload>) => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/categories/${categoryId}`,
      payload
    )

    return normalizeCategory(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const deleteMasterCategory = async (categoryId: string) => {
  try {
    await httpClient.delete<ApiSuccess<Record<string, unknown>>>(`/categories/${categoryId}`)
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const listMasterBrands = async (params: MasterListParams = {}): Promise<MasterBrandListResponse> => {
  try {
    const response = await httpClient.get<ApiSuccess<Record<string, unknown>>>('/brands', {
      params,
    })

    const normalized = normalizePaginated(extractApiData(response), normalizeBrand)
    const visibleItems = normalized.items.filter((item) => item.name !== HIDDEN_BRAND_NAME)
    const hiddenCount = normalized.items.length - visibleItems.length

    return {
      ...normalized,
      items: visibleItems,
      totalItems: Math.max(0, normalized.totalItems - hiddenCount),
      totalPages: Math.max(
        1,
        Math.ceil(Math.max(0, normalized.totalItems - hiddenCount) / Math.max(1, normalized.limit))
      ),
    }
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const createMasterBrand = async (payload: UpsertBrandPayload) => {
  try {
    const response = await httpClient.post<ApiSuccess<Record<string, unknown>>>('/brands', payload)
    return normalizeBrand(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const updateMasterBrand = async (brandId: string, payload: Partial<UpsertBrandPayload>) => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/brands/${brandId}`,
      payload
    )

    return normalizeBrand(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const deleteMasterBrand = async (brandId: string) => {
  try {
    await httpClient.delete<ApiSuccess<Record<string, unknown>>>(`/brands/${brandId}`)
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const listMasterColors = async (params: MasterListParams = {}): Promise<MasterColorListResponse> => {
  try {
    const response = await httpClient.get<ApiSuccess<Record<string, unknown>>>('/colors', {
      params,
    })

    return normalizePaginated(extractApiData(response), normalizeColor)
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const createMasterColor = async (payload: UpsertColorPayload) => {
  try {
    const response = await httpClient.post<ApiSuccess<Record<string, unknown>>>('/colors', payload)
    return normalizeColor(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const updateMasterColor = async (colorId: string, payload: Partial<UpsertColorPayload>) => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/colors/${colorId}`,
      payload
    )

    return normalizeColor(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const deleteMasterColor = async (colorId: string) => {
  try {
    await httpClient.delete<ApiSuccess<Record<string, unknown>>>(`/colors/${colorId}`)
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const listMasterSizes = async (params: MasterListParams = {}): Promise<MasterSizeListResponse> => {
  try {
    const response = await httpClient.get<ApiSuccess<Record<string, unknown>>>('/sizes', {
      params,
    })

    return normalizePaginated(extractApiData(response), normalizeSize)
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const createMasterSize = async (payload: UpsertSizePayload) => {
  try {
    const response = await httpClient.post<ApiSuccess<Record<string, unknown>>>('/sizes', payload)
    return normalizeSize(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const updateMasterSize = async (sizeId: string, payload: Partial<UpsertSizePayload>) => {
  try {
    const response = await httpClient.patch<ApiSuccess<Record<string, unknown>>>(
      `/sizes/${sizeId}`,
      payload
    )

    return normalizeSize(extractApiData(response))
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const deleteMasterSize = async (sizeId: string) => {
  try {
    await httpClient.delete<ApiSuccess<Record<string, unknown>>>(`/sizes/${sizeId}`)
  } catch (error) {
    throw toApiClientError(error)
  }
}

export const listActiveMasterCategories = async () => {
  const response = await listMasterCategories({
    page: 1,
    limit: REFERENCE_LIMIT,
    isActive: true,
  })

  return response.items
}

export const listActiveMasterBrands = async () => {
  const response = await listMasterBrands({
    page: 1,
    limit: REFERENCE_LIMIT,
    isActive: true,
  })

  return response.items
}

export const listActiveMasterColors = async () => {
  const response = await listMasterColors({
    page: 1,
    limit: REFERENCE_LIMIT,
    isActive: true,
  })

  return response.items
}

export const listActiveMasterSizes = async () => {
  const response = await listMasterSizes({
    page: 1,
    limit: REFERENCE_LIMIT,
    isActive: true,
  })

  return response.items
}
