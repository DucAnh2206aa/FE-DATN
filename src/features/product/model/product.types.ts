export interface PublicUserProfile {
  id: string
  fullName?: string
  avatarUrl?: string
  email?: string
}

export interface ProductCardItem {
  id: string
  _id?: string
  name: string
<<<<<<< HEAD
  slug: string
=======
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  categoryId: string
  brand: string
  description?: string
  images: string[]
  isAvailable: boolean
  averageRating: number
  reviewCount: number
  soldCount: number
  createdAt: string
  updatedAt: string
  thumbnailUrl: string | null
  priceFrom: number | null
  priceTo: number | null
  hasDiscount: boolean
}

export interface ProductVariantItem {
  id: string
  _id?: string
  productId: string
  sku: string
  color: string
  size: string
  colorHex?: string
  price: number
  originalPrice?: number
  stockQuantity: number
  isAvailable: boolean
  images: string[]
  createdAt: string
  updatedAt: string
}

export interface ProductDetailResponse {
  id: string
  _id?: string
  name: string
<<<<<<< HEAD
  slug: string
=======
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  categoryId: string
  brand: string
  description?: string
  attributes?: Record<string, unknown>
  images: string[]
  isAvailable: boolean
<<<<<<< HEAD
=======
  metaTitle?: string
  metaDescription?: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  averageRating: number
  reviewCount: number
  soldCount: number
  createdAt: string
  updatedAt: string
  variants: ProductVariantItem[]
}

export interface ReviewListItem {
  id: string
  _id?: string
  productId: string
  userId: string
  orderId: string
  rating: number
  content?: string
  images: string[]
  isPublished: boolean
  replyContent?: string
  repliedAt?: string
  repliedBy?: string
  createdAt: string
  updatedAt: string
  user?: PublicUserProfile
}

export interface CommentListItem {
  id: string
  _id?: string
  targetId: string
  targetModel: 'product'
  userId: string
  content: string
  parentId?: string
  isHidden: boolean
  createdAt: string
  user?: PublicUserProfile
}

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export type ProductListResponse = PaginatedResponse<ProductCardItem>
export type TopSellingResponse = ProductCardItem[]
export type NewestResponse = ProductCardItem[]

export interface ProductFilterCategory {
  id: string
  name: string
<<<<<<< HEAD
=======
  slug: string
  image?: string
}

export interface ProductFilterColor {
  id: string
  name: string
  hexCode?: string
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
}

export interface ProductFiltersResponse {
  categories: ProductFilterCategory[]
  brands: string[]
<<<<<<< HEAD
=======
  colors: ProductFilterColor[]
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
}
