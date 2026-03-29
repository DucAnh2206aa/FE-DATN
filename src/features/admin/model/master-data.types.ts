export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface MasterCategoryItem {
  id: string
  name: string
<<<<<<< HEAD
  description?: string
=======
  slug: string
  description?: string
  parentId?: string
  image?: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MasterBrandItem {
  id: string
  name: string
<<<<<<< HEAD
=======
  slug: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  description?: string
  logoUrl?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MasterColorItem {
  id: string
  name: string
<<<<<<< HEAD
=======
  slug: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  hexCode?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface MasterSizeItem {
  id: string
  name: string
<<<<<<< HEAD
=======
  slug: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export type MasterCategoryListResponse = PaginatedResponse<MasterCategoryItem>
export type MasterBrandListResponse = PaginatedResponse<MasterBrandItem>
export type MasterColorListResponse = PaginatedResponse<MasterColorItem>
export type MasterSizeListResponse = PaginatedResponse<MasterSizeItem>

export interface MasterListParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface UpsertCategoryPayload {
  name: string
<<<<<<< HEAD
  description?: string
=======
  slug: string
  description?: string
  parentId?: string
  image?: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  isActive?: boolean
}

export interface UpsertBrandPayload {
  name: string
<<<<<<< HEAD
=======
  slug: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  description?: string
  logoUrl?: string
  isActive?: boolean
}

export interface UpsertColorPayload {
  name: string
<<<<<<< HEAD
=======
  slug: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  hexCode?: string
  isActive?: boolean
}

export interface UpsertSizePayload {
  name: string
<<<<<<< HEAD
  isActive?: boolean
}
=======
  slug: string
  isActive?: boolean
}
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
