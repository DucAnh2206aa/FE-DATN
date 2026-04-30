import { MinusOutlined, PlusOutlined, ShoppingCartOutlined } from '@ant-design/icons'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Carousel,
  Col,
  Empty,
  Grid,
  InputNumber,
  List,
  message,
  Rate,
  Result,
  Row,
  Space,
  Spin,
  Tag,
  Typography,
} from 'antd'
import type { CarouselRef } from 'antd/es/carousel'
import DOMPurify from 'dompurify'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { useAppSelector } from '@/app/store/hooks'
import { getMyCart, upsertCartItem } from '@/features/cart/api/cart.api'
import type { CartResponse } from '@/features/cart/model/cart.types'
import {
  createProductComment,
  getProductComments,
  getProductDetail,
  getProductReviews,
  getProducts,
} from '@/features/product/api/product.api'
import { CommentComposer } from '@/features/product/components/CommentComposer'
import { ProductCard } from '@/features/product/components/ProductCard'
import type {
  CommentListItem,
  ProductVariantItem,
  ReviewListItem,
} from '@/features/product/model/product.types'
import { queryKeys } from '@/shared/api/queryKeys'
import { ROUTE_PATHS } from '@/shared/constants/routes'
import { formatVndCurrency } from '@/shared/utils/currency'
import { formatDateTime } from '@/shared/utils/date'
import { hasRichTextMarkup } from '@/shared/utils/rich-text'

const PRODUCT_PLACEHOLDER = '/images/product-placeholder.svg'

interface ProductDetailUiState {
  productId: string
  selectedVariantId: string | null
  purchaseQuantity: number
  activeImageIndex: number
  activeVariantSlide: number
}

const createDefaultProductDetailUiState = (productId: string): ProductDetailUiState => ({
  productId,
  selectedVariantId: null,
  purchaseQuantity: 1,
  activeImageIndex: 0,
  activeVariantSlide: 0,
})

const getVariantLabel = (variant: ProductVariantItem) =>
  `${variant.color?.trim() || 'Mặc định'} / ${variant.size?.trim() || 'Tiêu chuẩn'}`

const getVariantAvailabilityLabel = (variant: ProductVariantItem) =>
  variant.isAvailable && variant.stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'

const formatPriceRange = (variants: ProductVariantItem[]) => {
  if (variants.length === 0) {
    return 'Liên hệ'
  }

  const prices = variants.map((variant) => variant.price)
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)

  if (minPrice === maxPrice) {
    return formatVndCurrency(minPrice)
  }

  return `${formatVndCurrency(minPrice)} - ${formatVndCurrency(maxPrice)}`
}

const renderVariantPrice = (variant: ProductVariantItem) => {
  if (variant.originalPrice && variant.originalPrice > variant.price) {
    return (
      <Space direction="vertical" size={0}>
        <Typography.Text
          strong
          className="!text-lg !leading-7 !text-blue-700 !whitespace-nowrap xl:!text-[30px]"
        >
          {formatVndCurrency(variant.price)}
        </Typography.Text>
        <Typography.Text type="secondary" delete className="text-xs leading-4 !whitespace-nowrap">
          {formatVndCurrency(variant.originalPrice)}
        </Typography.Text>
      </Space>
    )
  }

  return (
    <Typography.Text
      strong
      className="!text-lg !leading-7 !text-blue-700 !whitespace-nowrap xl:!text-[30px]"
    >
      {formatVndCurrency(variant.price)}
    </Typography.Text>
  )
}

export const ProductDetailPage = () => {
  const { productId = '' } = useParams()
  const screens = Grid.useBreakpoint()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const accessToken = useAppSelector((state) => state.auth.accessToken)
  const [uiState, setUiState] = useState<ProductDetailUiState>(() =>
    createDefaultProductDetailUiState(productId)
  )
  const carouselRef = useRef<CarouselRef>(null)
  const variantCarouselRef = useRef<CarouselRef>(null)

  const currentUiState =
    uiState.productId === productId ? uiState : createDefaultProductDetailUiState(productId)
  const { selectedVariantId, purchaseQuantity, activeImageIndex, activeVariantSlide } =
    currentUiState

  const productDetailQuery = useQuery({
    queryKey: queryKeys.products.detail(productId),
    queryFn: () => getProductDetail(productId),
    enabled: Boolean(productId),
  })

  const productReviewsQuery = useQuery({
    queryKey: queryKeys.products.reviews(productId),
    queryFn: () => getProductReviews(productId, 1, 5),
    enabled: Boolean(productId),
  })

  const productCommentsQuery = useQuery({
    queryKey: queryKeys.products.comments(productId),
    queryFn: () => getProductComments(productId, 1, 10),
    enabled: Boolean(productId),
  })

  const relatedProductsQuery = useQuery({
    queryKey: queryKeys.products.related(productId, productDetailQuery.data?.categoryId),
    queryFn: () =>
      getProducts({
        page: 1,
        limit: 12,
        isAvailable: true,
        categoryId: productDetailQuery.data?.categoryId,
      }),
    enabled: Boolean(productId) && Boolean(productDetailQuery.data?.categoryId),
  })

  const commentMutation = useMutation({
    mutationFn: (content: string) =>
      createProductComment({
        targetId: productId,
        content,
      }),
    onSuccess: async () => {
      void message.success('Đã gửi bình luận')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.products.comments(productId),
      })
    },
    onError: (error) => {
      void message.error(error.message)
    },
  })

  const addToCartMutation = useMutation({
    mutationFn: upsertCartItem,
    onSuccess: async () => {
      void message.success('Đã thêm sản phẩm vào giỏ hàng')
      await queryClient.invalidateQueries({
        queryKey: queryKeys.cart.me,
      })
    },
    onError: (error) => {
      void message.error(error.message)
    },
  })

  const product = productDetailQuery.data
  const normalizedDescription = product?.description?.trim() ?? ''
  const hasMarkupDescription = hasRichTextMarkup(normalizedDescription)
  const sanitizedDescriptionHtml = useMemo(() => {
    if (!normalizedDescription) {
      return ''
    }

    return DOMPurify.sanitize(normalizedDescription)
  }, [normalizedDescription])

  const gallery = useMemo(() => {
    if (!product) {
      return [PRODUCT_PLACEHOLDER]
    }

    const imageSet = new Set<string>()

    for (const image of product.images) {
      if (image.trim()) {
        imageSet.add(image)
      }
    }

    for (const variant of product.variants) {
      for (const image of variant.images) {
        if (image.trim()) {
          imageSet.add(image)
        }
      }
    }

    return imageSet.size > 0 ? Array.from(imageSet) : [PRODUCT_PLACEHOLDER]
  }, [product])

  const variantImageIndexMap = useMemo(() => {
    const imageIndexMap = new Map<string, number>()

    if (!product) {
      return imageIndexMap
    }

    for (const variant of product.variants) {
      const primaryVariantImage = variant.images[0] ?? product.images[0] ?? PRODUCT_PLACEHOLDER
      const imageIndex = gallery.indexOf(primaryVariantImage)
      imageIndexMap.set(variant.id, imageIndex >= 0 ? imageIndex : 0)
    }

    return imageIndexMap
  }, [gallery, product])

  const resolvedSelectedVariantId = useMemo(() => {
    if (!product) {
      return null
    }

    if (selectedVariantId && product.variants.some((variant) => variant.id === selectedVariantId)) {
      return selectedVariantId
    }

    return product.variants[0]?.id ?? null
  }, [product, selectedVariantId])

  const selectedVariant = useMemo(() => {
    if (!product || !resolvedSelectedVariantId) {
      return undefined
    }

    return product.variants.find((variant) => variant.id === resolvedSelectedVariantId)
  }, [product, resolvedSelectedVariantId])

  const displayedVariant = useMemo(() => {
    if (!product) {
      return undefined
    }

    return selectedVariant ?? product.variants[0]
  }, [product, selectedVariant])

  const variantCardsPerSlide = screens.lg ? 3 : screens.sm ? 2 : 1
  const variantSlides = useMemo(() => {
    if (!product || product.variants.length === 0) {
      return []
    }

    return Array.from(
      { length: Math.ceil(product.variants.length / variantCardsPerSlide) },
      (_, index) =>
        product.variants.slice(
          index * variantCardsPerSlide,
          index * variantCardsPerSlide + variantCardsPerSlide
        )
    )
  }, [product, variantCardsPerSlide])
  const variantSlideIndexMap = useMemo(() => {
    const slideIndexMap = new Map<string, number>()

    variantSlides.forEach((slideVariants, slideIndex) => {
      slideVariants.forEach((variant) => {
        slideIndexMap.set(variant.id, slideIndex)
      })
    })

    return slideIndexMap
  }, [variantSlides])
  const maxVariantSlideIndex = Math.max(variantSlides.length - 1, 0)
  const resolvedActiveVariantSlide = Math.min(activeVariantSlide, maxVariantSlideIndex)
  const hasMultipleVariantSlides = variantSlides.length > 1
  const variantGridClassName = screens.lg
    ? 'grid-cols-3'
    : screens.sm
      ? 'grid-cols-2'
      : 'grid-cols-1'
  const resolvedActiveImageIndex = Math.min(activeImageIndex, Math.max(gallery.length - 1, 0))

  const relatedProducts = (relatedProductsQuery.data?.items ?? [])
    .filter((item) => item.id !== productId)
    .slice(0, 8)

  useEffect(() => {
    if (!resolvedSelectedVariantId) {
      return
    }

    const nextSlideIndex = variantSlideIndexMap.get(resolvedSelectedVariantId) ?? 0
    const clampedSlideIndex = Math.min(nextSlideIndex, maxVariantSlideIndex)

    variantCarouselRef.current?.goTo(clampedSlideIndex)
  }, [maxVariantSlideIndex, resolvedSelectedVariantId, variantCardsPerSlide, variantSlideIndexMap])

  const handleSelectVariant = (variant: ProductVariantItem) => {
    const nextImageIndex = variantImageIndexMap.get(variant.id) ?? 0
    const nextSlideIndex = variantSlideIndexMap.get(variant.id) ?? 0
    setUiState((prev) => ({
      ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
      productId,
      selectedVariantId: variant.id,
      purchaseQuantity: 1,
      activeImageIndex: nextImageIndex,
      activeVariantSlide: nextSlideIndex,
    }))
    carouselRef.current?.goTo(nextImageIndex)
    variantCarouselRef.current?.goTo(nextSlideIndex)
  }

  const handleSelectGalleryImage = (index: number) => {
    setUiState((prev) => ({
      ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
      productId,
      activeImageIndex: index,
    }))
    carouselRef.current?.goTo(index)
  }

  const handleGalleryAfterChange = (index: number) => {
    setUiState((prev) => ({
      ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
      productId,
      activeImageIndex: index,
    }))
  }

  const handleVariantCarouselAfterChange = (slideIndex: number) => {
    setUiState((prev) => ({
      ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
      productId,
      activeVariantSlide: slideIndex,
    }))
  }

  const handleVariantSlidePrev = () => {
    variantCarouselRef.current?.prev()
  }

  const handleVariantSlideNext = () => {
    variantCarouselRef.current?.next()
  }

  const handleDecreaseQuantity = () => {
    setUiState((prev) => {
      const base =
        prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)
      return {
        ...base,
        productId,
        purchaseQuantity: Math.max(1, base.purchaseQuantity - 1),
      }
    })
  }

  const handleIncreaseQuantity = () => {
    if (!selectedVariant) {
      void message.warning('Vui lòng chọn phiên bản sản phẩm trước')
      return
    }

    if (selectedVariant.stockQuantity <= 0) {
      void message.error('Phiên bản đã hết hàng')
      return
    }

    setUiState((prev) => {
      const base =
        prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)
      const nextValue = base.purchaseQuantity + 1
      return {
        ...base,
        productId,
        purchaseQuantity: Math.min(nextValue, selectedVariant.stockQuantity),
      }
    })
  }

  const handlePurchaseQuantityChange = (value: number | null) => {
    if (value === null) {
      return
    }

    const normalizedValue = Math.max(1, Math.trunc(value))

    if (!selectedVariant) {
      setUiState((prev) => ({
        ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
        productId,
        purchaseQuantity: normalizedValue,
      }))
      return
    }

    if (selectedVariant.stockQuantity <= 0) {
      setUiState((prev) => ({
        ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
        productId,
        purchaseQuantity: 1,
      }))
      return
    }

    setUiState((prev) => ({
      ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
      productId,
      purchaseQuantity: Math.min(normalizedValue, selectedVariant.stockQuantity),
    }))
  }

  const handleAddToCart = async () => {
    if (!accessToken) {
      void message.warning('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng')
      navigate(ROUTE_PATHS.LOGIN)
      return
    }

    if (!selectedVariant) {
      void message.warning('Bạn cần chọn phiên bản sản phẩm trước khi thêm vào giỏ hàng')
      return
    }

    if (!selectedVariant.isAvailable || selectedVariant.stockQuantity <= 0) {
      void message.error('Phiên bản đã hết hàng')
      return
    }

    const normalizedQuantity = Math.min(
      Math.max(purchaseQuantity, 1),
      selectedVariant.stockQuantity
    )

    if (normalizedQuantity !== purchaseQuantity) {
      setUiState((prev) => ({
        ...(prev.productId === productId ? prev : createDefaultProductDetailUiState(productId)),
        productId,
        purchaseQuantity: normalizedQuantity,
      }))
    }

    const cachedCart = queryClient.getQueryData<CartResponse>(queryKeys.cart.me)
    const resolvedCart: CartResponse =
      cachedCart ??
      (await queryClient.fetchQuery({
        queryKey: queryKeys.cart.me,
        queryFn: getMyCart,
      }))

    const existingQuantity =
      resolvedCart.items.find((item) => item.variantId === selectedVariant.id)?.quantity ?? 0
    const nextQuantity = Math.min(
      existingQuantity + normalizedQuantity,
      selectedVariant.stockQuantity
    )

    if (nextQuantity <= existingQuantity) {
      void message.warning('Số lượng trong giỏ đã đạt tối đa theo tồn kho')
      return
    }

    addToCartMutation.mutate({
      productId,
      variantId: selectedVariant.id,
      quantity: nextQuantity,
      selectedAttributes: {
        color: selectedVariant.color,
        size: selectedVariant.size,
      },
    })
  }

  const displayedVariantSavings =
    displayedVariant?.originalPrice && displayedVariant.originalPrice > displayedVariant.price
      ? displayedVariant.originalPrice - displayedVariant.price
      : 0

  if (productDetailQuery.isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (productDetailQuery.isError || !product) {
    return (
      <Result
        status="404"
        title="Không tìm thấy sản phẩm"
        extra={
          <Button type="primary">
            <Link to={ROUTE_PATHS.ROOT}>Quay về trang chủ</Link>
          </Button>
        }
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1240px] space-y-3 px-2 py-2 lg:px-3">
      <div className="grid gap-2 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="!overflow-hidden !rounded-[12px] !border-slate-200/80 !shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)] !p-2">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-1">
              <Typography.Title level={5} className="!mb-0 !text-sm md:!text-base">
                Ảnh
              </Typography.Title>
              <Typography.Text type="secondary" className="text-xs">
                {resolvedActiveImageIndex + 1}/{gallery.length}
              </Typography.Text>
            </div>

            <Carousel
              ref={carouselRef}
              draggable
              dots={false}
              afterChange={handleGalleryAfterChange}
              className="product-detail-gallery-carousel"
            >
              {gallery.map((image, index) => (
                <div key={`${image}-${index}`}>
                  <div className="aspect-square overflow-hidden rounded-[12px] bg-slate-100">
                    <img
                      src={image}
                      alt={`${product.name}-${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </Carousel>

            <div className="product-detail-gallery-thumbnails flex gap-1 overflow-x-auto pb-0.5">
              {gallery.map((image, index) => {
                const isActive = index === resolvedActiveImageIndex

                return (
                  <button
                    key={`${image}-thumb-${index}`}
                    type="button"
                    onClick={() => handleSelectGalleryImage(index)}
                    className={`group relative h-14 w-14 shrink-0 overflow-hidden rounded-lg border transition-all duration-200 ${
                      isActive
                        ? 'border-blue-500 shadow-[0_18px_36px_-28px_rgba(37,99,235,0.7)]'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                    aria-label={`Xem ảnh ${index + 1}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name}-thumbnail-${index + 1}`}
                      className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <span
                      className={`absolute inset-0 bg-slate-950/10 transition-opacity ${
                        isActive ? 'opacity-0' : 'opacity-100'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
          </div>
        </Card>

        <Card className="!rounded-[12px] !border-slate-200/80 !shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)] !p-2">
          <div className="space-y-2">
            <div className="space-y-1">
              <Space size={[4, 4]} wrap>
                <Tag color="blue" className="!text-xs">
                  {product.brand}
                </Tag>
                {displayedVariant ? (
                  <Tag
                    color={displayedVariant.isAvailable ? 'green' : 'default'}
                    className="!text-xs"
                  >
                    {getVariantAvailabilityLabel(displayedVariant)}
                  </Tag>
                ) : null}
              </Space>

              <Typography.Title level={4} className="!mb-0 !text-lg !leading-tight md:!text-xl">
                {product.name}
              </Typography.Title>

              <Typography.Paragraph className="!mb-0 !text-xs text-slate-500">
                {selectedVariant
                  ? `${getVariantLabel(selectedVariant)} • SKU ${selectedVariant.sku}`
                  : 'Chọn biến thể bên trái'}
              </Typography.Paragraph>
            </div>

            <div className="space-y-0.5 rounded-lg border border-blue-100 bg-[radial-gradient(circle_at_top_left,_rgba(219,234,254,0.75),_rgba(255,255,255,0.96)_60%)] p-2">
              <Typography.Title level={4} className="!mb-0 !text-base !text-blue-700">
                {displayedVariant
                  ? formatVndCurrency(displayedVariant.price)
                  : formatPriceRange(product.variants)}
              </Typography.Title>
              {displayedVariant?.originalPrice &&
              displayedVariant.originalPrice > displayedVariant.price ? (
                <Space size={3} wrap>
                  <Typography.Text type="secondary" delete className="!text-xs">
                    {formatVndCurrency(displayedVariant.originalPrice)}
                  </Typography.Text>
                  <Tag color="red" className="!m-0 !text-xs">
                    Tiết kiệm {formatVndCurrency(displayedVariantSavings)}
                  </Tag>
                </Space>
              ) : null}
              <Space size={[4, 2]} wrap>
                <Rate disabled allowHalf value={product.averageRating} className="!text-[10px]" />
                <Typography.Text type="secondary" className="!text-xs">
                  {product.reviewCount} đánh giá
                </Typography.Text>
                <Typography.Text type="secondary" className="!text-xs">
                  Đã bán {product.soldCount}
                </Typography.Text>
              </Space>
            </div>

            <div className="space-y-1 max-h-full overflow-y-auto">
              <Typography.Text className="!text-xs text-slate-600">
                Phiên bản sẵn có
              </Typography.Text>
              <div className="grid grid-cols-4 gap-1">
                {product.variants.length === 0 ? (
                  <Typography.Text type="secondary" className="!text-xs col-span-4">
                    Chưa có phiên bản
                  </Typography.Text>
                ) : (
                  product.variants.map((variant) => {
                    const image = variant.images[0] ?? product.images[0] ?? PRODUCT_PLACEHOLDER
                    const isSelected = variant.id === resolvedSelectedVariantId
                    const availabilityLabel = getVariantAvailabilityLabel(variant)

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleSelectVariant(variant)}
                        className={`flex flex-col items-center gap-0.5 rounded-lg border p-0.5 text-center transition-all duration-200 ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50/70'
                            : 'border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          <img
                            src={image}
                            alt={`${getVariantLabel(variant)}`}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <Typography.Text className="!text-[10px] leading-3 line-clamp-1">
                          {getVariantLabel(variant)}

                        </Typography.Text>
                         <span className={`text-xs ${
                            variant.isAvailable && variant.stockQuantity > 0
                              ? 'text-green-600'
                              : 'text-slate-500'
                          }`}>
                            {availabilityLabel} ({variant.stockQuantity})
                          </span>
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-2">
              <div className="flex flex-col gap-2">
                <div className="space-y-0.5">
                  <Typography.Text className="!text-xs">Số lượng mua</Typography.Text>
                  <div className="flex items-center gap-1">
                    <Button
                      size="small"
                      icon={<MinusOutlined />}
                      onClick={handleDecreaseQuantity}
                      disabled={
                        !selectedVariant || purchaseQuantity <= 1 || addToCartMutation.isPending
                      }
                      className="!h-8 !w-8"
                    />
                    <InputNumber
                      min={1}
                      max={selectedVariant?.stockQuantity ?? 1}
                      controls={false}
                      precision={0}
                      value={purchaseQuantity}
                      disabled={
                        !selectedVariant ||
                        selectedVariant.stockQuantity <= 0 ||
                        addToCartMutation.isPending
                      }
                      onChange={handlePurchaseQuantityChange}
                      className="w-16"
                    />
                    <Button
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={handleIncreaseQuantity}
                      disabled={
                        !selectedVariant ||
                        addToCartMutation.isPending ||
                        purchaseQuantity >= selectedVariant.stockQuantity
                      }
                      className="!h-8 !w-8"
                    />
                  </div>
                </div>

                <Button
                  type="primary"
                  block
                  size="small"
                  icon={<ShoppingCartOutlined />}
                  className="!h-9 !rounded-lg !text-xs"
                  loading={addToCartMutation.isPending}
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ hàng
                </Button>

                {!accessToken ? (
                  <Typography.Paragraph className="!mb-0 !text-xs" type="secondary">
                    Vui lòng <Link to={ROUTE_PATHS.LOGIN}>đăng nhập</Link> để thêm vào giỏ
                  </Typography.Paragraph>
                ) : null}
              </div>
            </div>

            <Space size={[6, 6]} wrap>
              <Badge status="processing" text="COD" />
              <Badge status="success" text="ZaloPay" />
            </Space>
          </div>
        </Card>
      </div>

      <Card title="Mô tả sản phẩm">
        {normalizedDescription ? (
          hasMarkupDescription ? (
            <div
              className="rich-text-render text-slate-700"
              dangerouslySetInnerHTML={{
                __html: sanitizedDescriptionHtml,
              }}
            />
          ) : (
            <Typography.Paragraph className="!mb-0 whitespace-pre-line">
              {normalizedDescription}
            </Typography.Paragraph>
          )
        ) : (
          <Typography.Paragraph className="!mb-0" type="secondary">
            Sản phẩm chưa có mô tả chi tiết.
          </Typography.Paragraph>
        )}
      </Card>

      <Card title="Đánh giá khách hàng">
        {productReviewsQuery.isLoading ? <Spin /> : null}

        <List
          dataSource={productReviewsQuery.data?.items ?? []}
          renderItem={(review: ReviewListItem) => (
            <List.Item>
              <List.Item.Meta
                avatar={
                  <Avatar src={review.user?.avatarUrl}>
                    {review.user?.fullName?.charAt(0) ?? 'U'}
                  </Avatar>
                }
                title={
                  <Space direction="vertical" size={0}>
                    <Typography.Text strong>
                      {review.user?.fullName ?? review.user?.email ?? 'Khách hàng'}
                    </Typography.Text>
                    <Rate disabled value={review.rating} className="!text-sm" />
                  </Space>
                }
                description={
                  <Space direction="vertical" size={4}>
                    <Typography.Paragraph className="!mb-0">
                      {review.content || 'Không có nội dung'}
                    </Typography.Paragraph>

                    <Typography.Text type="secondary" className="text-xs">
                      {formatDateTime(review.createdAt)}
                    </Typography.Text>
                    {review.replyContent ? (
                      <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2">
                        <Typography.Text strong className="block text-xs text-blue-700">
                          Phản hồi từ cửa hàng
                        </Typography.Text>
                        <Typography.Paragraph className="!mb-0 !mt-1 text-sm">
                          {review.replyContent}
                        </Typography.Paragraph>
                        {review.repliedAt ? (
                          <Typography.Text type="secondary" className="text-xs">
                            {formatDateTime(review.repliedAt)}
                          </Typography.Text>
                        ) : null}
                      </div>
                    ) : null}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      <Card title="Bình luận">
        <Space direction="vertical" size="large" className="w-full">
          <CommentComposer
            isAuthenticated={Boolean(accessToken)}
            isSubmitting={commentMutation.isPending}
            onSubmit={async (content) => {
              await commentMutation.mutateAsync(content)
            }}
          />

          <Typography.Text type="secondary">
            {productCommentsQuery.data?.items.length ?? 0} bình luận
          </Typography.Text>

          {productCommentsQuery.isLoading ? (
            <div className="py-4 text-center">
              <Spin />
            </div>
          ) : null}

          <List
            dataSource={productCommentsQuery.data?.items ?? []}
            split={false}
            renderItem={(comment: CommentListItem) => (
              <List.Item className="!px-0">
                <div className="w-full rounded-xl border border-slate-200 bg-white p-4">
                  <List.Item.Meta
                    avatar={
                      <Avatar src={comment.user?.avatarUrl}>
                        {comment.user?.fullName?.charAt(0) ?? 'U'}
                      </Avatar>
                    }
                    title={comment.user?.fullName ?? comment.user?.email ?? 'Người dùng'}
                    description={
                      <Space direction="vertical" size={4}>
                        <Typography.Paragraph className="!mb-0 text-slate-700">
                          {comment.content}
                        </Typography.Paragraph>
                        <Typography.Text type="secondary" className="text-xs">
                          {formatDateTime(comment.createdAt)}
                        </Typography.Text>
                      </Space>
                    }
                  />
                </div>
              </List.Item>
            )}
          />
        </Space>
      </Card>

      <Card title="Sản phẩm liên quan">
        {relatedProductsQuery.isLoading ? <Spin /> : null}

        {!relatedProductsQuery.isLoading && relatedProducts.length === 0 ? (
          <Empty description="Không có sản phẩm liên quan" />
        ) : null}

        <Row gutter={[16, 16]}>
          {relatedProducts.map((item) => (
            <Col key={item.id} xs={24} sm={12} lg={8} xl={6}>
              <ProductCard product={item} compact />
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  )
}
