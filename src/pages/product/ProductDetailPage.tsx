import { LeftOutlined, MinusOutlined, PlusOutlined, RightOutlined, ShoppingCartOutlined } from '@ant-design/icons'
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
  List,
  message,
  Radio,
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
import { chunk } from 'lodash'
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
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null)
  const [purchaseQuantity, setPurchaseQuantity] = useState(1)
  const carouselRef = useRef<CarouselRef>(null)
  const variantCarouselRef = useRef<CarouselRef>(null)

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

  const selectedVariant = useMemo(() => {
    if (!product) {
      return undefined
    }

    return product.variants.find((variant) => variant.id === selectedVariantId)
  }, [product, selectedVariantId])

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

  const variantCardsPerSlide = screens.xxl ? 4 : screens.lg ? 3 : screens.md ? 2 : 1
  const variantGapPx = 8
  const variantItemWidth = useMemo(() => {
    if (variantCardsPerSlide <= 1) {
      return '100%'
    }

    return `calc((100% - ${(variantCardsPerSlide - 1) * variantGapPx}px) / ${variantCardsPerSlide})`
  }, [variantCardsPerSlide])

  const variantSlides = useMemo(() => {
    if (!product || product.variants.length === 0) {
      return []
    }

    return chunk(product.variants, variantCardsPerSlide)
  }, [product, variantCardsPerSlide])

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

  // worklog: 2026-03-04 21:11:32 | quochuy | refactor | handleSelectVariant
  // worklog: 2026-03-04 18:01:37 | trantu | cleanup | handleSelectVariant
  const handleSelectVariant = (variant: ProductVariantItem) => {
    setSelectedVariantId(variant.id)
    setPurchaseQuantity(1)
    carouselRef.current?.goTo(variantImageIndexMap.get(variant.id) ?? 0)
  }
  
  const handleVariantSlidePrev = () => {
    variantCarouselRef.current?.prev()
  }

  const handleVariantSlideNext = () => {
    variantCarouselRef.current?.next()
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

  // worklog: 2026-03-04 14:54:46 | trantu | refactor | handleDecreaseQuantity
  const handleDecreaseQuantity = () => {
    setPurchaseQuantity((prev) => Math.max(1, prev - 1))
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

    setPurchaseQuantity((prev) => {
      const nextValue = prev + 1
      return Math.min(nextValue, selectedVariant.stockQuantity)
    })
  }

  const handleAddToCart = async () => {
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
      setPurchaseQuantity(normalizedQuantity)
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
    <div className="space-y-8 py-6">
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={13}>
          <Card className="h-full">
            <Carousel ref={carouselRef} draggable>
              {gallery.map((image, index) => (
                <div key={`${image}-${index}`}>
                  <div className="aspect-[4/3] overflow-hidden rounded-lg bg-slate-100">
                    <img
                      src={image}
                      alt={`${product.name}-${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ))}
            </Carousel>
            <div className="w-full border-t border-slate-200 pt-4">
              <div className="space-y-1">
                <Typography.Title level={4} className="!mb-0 !text-xl md:!text-[30px]">
                    Phiên bản sản phẩm
                </Typography.Title>
                <Typography.Text type="secondary">
                    {product.variants.length} phiên bản để lựa chọn
                  </Typography.Text>
              </div>
              {hasMultipleVariantSlides ? (
                  <Space size={8}>
                    <Button
                      shape="circle"
                      icon={<LeftOutlined />}
                      aria-label="Xem phiên bản trước"
                      disabled={activeVariantSlide <= 0}
                      onClick={handleVariantSlidePrev}
                    />
                    <Button
                      shape="circle"
                      type="primary"
                      ghost
                      icon={<RightOutlined />}
                      aria-label="Xem phiên bản tiếp theo"
                      disabled={activeVariantSlide >= variantSlides.length - 1}
                      onClick={handleVariantSlideNext}
                    />
                  </Space>
                ) : null}
              {product.variants.length === 0 ? (
                <div className="pt-3">
                  <Empty description="Hiện chưa có phiên bản sản phẩm" />
                </div>
              ) : (
                <div className="pt-3">
                  <Radio.Group
                    value={selectedVariantId ?? undefined}
                    className="w-full"
                    onChange={(event) => {
                      const selected = product.variants.find(
                        (variant) => variant.id === String(event.target.value)
                      )

                      if (selected) {
                        handleSelectVariant(selected)
                      }
                    }}
                  >
                    <Carousel
                      autoplay={variantSlides.length > 1}
                      autoplaySpeed={3500}
                      pauseOnHover
                      draggable
                      dots
                      infinite={variantSlides.length > 1}
                      className="product-variant-carousel"
                    >
                      {variantSlides.map((slideVariants, slideIndex) => (
                        <div key={`variant-slide-${slideIndex}`} className="w-full">
                          <div className="flex items-stretch gap-2 overflow-hidden">
                            {slideVariants.map((variant) => {
                              const image =
                                variant.images[0] ?? product.images[0] ?? PRODUCT_PLACEHOLDER
                              const isSelected = variant.id === selectedVariantId

                              return (
                                <div
                                  key={variant.id}
                                  className="flex"
                                  style={{
                                    flex: `0 0 ${variantItemWidth}`,
                                    maxWidth: variantItemWidth,
                                  }}
                                >
                                  <Radio
                                    value={variant.id}
                                    className={`product-variant-option !m-0 !flex flex-1 !w-full items-stretch rounded-lg border p-2 transition-all [&>span:last-child]:flex [&>span:last-child]:w-full [&>span:last-child]:flex-1 ${
                                      isSelected
                                        ? 'border-blue-500 bg-blue-50/70 shadow-[0_20px_40px_-30px_rgba(37,99,235,0.7)]'
                                        : 'border-slate-200 hover:border-blue-300 hover:shadow-[0_18px_36px_-32px_rgba(15,23,42,0.5)]'
                                    }`}
                                  >
                                    <div className="h-full w-full">
                                      <div className="flex h-full gap-2">
                                        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-slate-100">
                                          <img
                                            src={image}
                                            alt={`${product.name}-${variant.color}-${variant.size}`}
                                            className="h-full w-full object-cover"
                                          />
                                        </div>

                                        <Space
                                          direction="vertical"
                                          size={1}
                                          className="min-w-0 flex-1"
                                        >
                                          <Typography.Text
                                            strong
                                            className="line-clamp-1 !text-[13px] leading-4"
                                          >
                                            {variant.color} / {variant.size}
                                          </Typography.Text>

                                          <Typography.Text
                                            type="secondary"
                                            className="line-clamp-1 !text-[11px]"
                                          >
                                            SKU: {variant.sku}
                                          </Typography.Text>

                                          {renderVariantPrice(variant)}

                                          <Space
                                            size={4}
                                            align="center"
                                            className="w-full justify-between"
                                          >
                                            {variant.colorHex ? (
                                              <span
                                                className="inline-block h-3 w-3 rounded-full border border-slate-300"
                                                style={{ backgroundColor: variant.colorHex }}
                                              />
                                            ) : (
                                              <span className="inline-block h-3 w-3" />
                                            )}
                                            <Tag
                                              color={variant.isAvailable ? 'green' : 'default'}
                                              className="!m-0 !px-1 !text-[10px] !leading-4"
                                            >
                                              {variant.isAvailable ? 'Còn hàng' : 'Hết hàng'}
                                            </Tag>
                                          </Space>
                                        </Space>
                                      </div>
                                    </div>
                                  </Radio>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </Carousel>
                    {hasMultipleVariantSlides ? (
                      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
                        <Button
                          icon={<LeftOutlined />}
                          disabled={activeVariantSlide <= 0}
                          onClick={handleVariantSlidePrev}
                        >
                          Trước
                        </Button>
                         <Typography.Text type="secondary" className="text-xs sm:text-sm">
                          {`Trang ${activeVariantSlide + 1}/${variantSlides.length}`}
                        </Typography.Text>
                        <Button
                          type="primary"
                            ghost
                            icon={<RightOutlined />}
                            iconPosition="end"
                            disabled={activeVariantSlide >= variantSlides.length - 1}
                            onClick={handleVariantSlideNext}
                        >
                          Tiếp
                        </Button>
                      </div>
                    ) : null}
                  </Radio.Group>

                  <Typography.Paragraph className="!mb-0 !mt-2 text-xs" type="secondary">
                    {selectedVariant
                      ? `Đang chọn: ${selectedVariant.color} / ${selectedVariant.size}`
                      : 'Chọn một phiên bản để xem ảnh đúng biến thể và thêm vào giỏ hàng.'}
                  </Typography.Paragraph>
                </div>
              )}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={11}>
          <Card className="h-full">
            <Space direction="vertical" size="middle" className="w-full">
              <Typography.Title
                level={2}
                className="!mb-0 !text-3xl md:!text-[42px] !leading-tight"
              >
                {product.name}
              </Typography.Title>

              <Space size={[8, 8]} wrap>
                <Tag color="blue">{product.brand}</Tag>
                {displayedVariant ? (
                  <Tag color={displayedVariant.isAvailable ? 'green' : 'default'}>
                    {displayedVariant.color} / {displayedVariant.size}
                  </Tag>
                ) : null}
              </Space>

              <Space size="middle" wrap>
                <Rate disabled allowHalf value={product.averageRating} />
                <Typography.Text type="secondary">{product.reviewCount} đánh giá</Typography.Text>
                <Typography.Text type="secondary">Đã bán: {product.soldCount}</Typography.Text>
              </Space>

              <Typography.Title level={3} className="!mb-0 !text-blue-700">
                {displayedVariant
                  ? formatVndCurrency(displayedVariant.price)
                  : formatPriceRange(product.variants)}
              </Typography.Title>

              {displayedVariant?.originalPrice &&
              displayedVariant.originalPrice > displayedVariant.price ? (
                <Typography.Text type="secondary" delete>
                  {formatVndCurrency(displayedVariant.originalPrice)}
                </Typography.Text>
              ) : null}

              <Typography.Paragraph className="!mb-0" type="secondary">
                Cập nhật: {formatDateTime(product.updatedAt)}
              </Typography.Paragraph>

              <Typography.Paragraph className="!mb-0" type="secondary">
                {displayedVariant
                  ? `SKU: ${displayedVariant.sku} • Tồn kho: ${displayedVariant.stockQuantity}`
                  : 'Sản phẩm chưa có phiên bản cụ thể'}
              </Typography.Paragraph>

              <div className="w-full border-t border-slate-200 pt-4">
                <Typography.Text strong>Phương thức thanh toán</Typography.Text>
                <Space direction="vertical" size={10} className="mt-3 w-full">
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <Badge status="processing" text="COD - Thanh toán khi nhận hàng" />
                    <Tag color="blue" className="!m-0">
                      Hỗ trợ
                    </Tag>
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <Badge status="success" text="VNPay - Thanh toán online" />
                    <Tag color="green" className="!m-0">
                      Hỗ trợ
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                    <Badge status="success" text="ZaloPay - Thanh toán online" />
                    <Tag color="green" className="!m-0">
                      Hỗ trợ
                    </Tag>
                  </div>
                </Space>
                <Typography.Paragraph className="!mb-0 !mt-2 text-xs" type="secondary">
                  Phương thức thanh toán được xác nhận ở bước đặt hàng.
                </Typography.Paragraph>
              </div>

              <div className="w-full border-t border-slate-200 pt-4">
                <Typography.Text strong>Số lượng mua</Typography.Text>
                <Space className="mt-3 ml-3" size="middle" align="center" wrap>
                  <Space size={6} align="center">
                    <Button
                      icon={<MinusOutlined />}
                      onClick={handleDecreaseQuantity}
                      disabled={
                        !selectedVariant || purchaseQuantity <= 1 || addToCartMutation.isPending
                      }
                    />
                    <Typography.Text className="inline-block min-w-8 text-center">
                      {purchaseQuantity}
                    </Typography.Text>
                    <Button
                      icon={<PlusOutlined />}
                      onClick={handleIncreaseQuantity}
                      disabled={
                        !selectedVariant ||
                        addToCartMutation.isPending ||
                        purchaseQuantity >= selectedVariant.stockQuantity
                      }
                    />
                  </Space>
                  <Typography.Text type="secondary" className="text-xs">
                    {selectedVariant
                      ? `Tồn kho tối đa: ${selectedVariant.stockQuantity}`
                      : 'Vui lòng chọn phiên bản sản phẩm để thêm vào giỏ hàng'}
                  </Typography.Text>
                </Space>

                <Button
                  type="primary"
                  block
                  icon={<ShoppingCartOutlined />}
                  className="!mt-4"
                  loading={addToCartMutation.isPending}
                  onClick={handleAddToCart}
                >
                  Thêm vào giỏ hàng
                </Button>

                {!accessToken ? (
                  <Typography.Paragraph className="!mb-0 !mt-2 text-xs" type="secondary">
                    Bạn cần đăng nhập trước khi thêm sản phẩm vào giỏ hàng.
                  </Typography.Paragraph>
                ) : null}
              </div>
              <Space size={[8, 8]} wrap>
              <Badge status="processing" text="COD" />
              <Badge status="success" text="VNPay" />
              <Badge status="success" text="ZaloPay" />
            </Space>
          </div>
        </Card>
      </div>

      <Card className="!rounded-[28px] !border-slate-200/80 !shadow-[0_24px_60px_-48px_rgba(15,23,42,0.55)]">
        <div className="space-y-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1">
              <Typography.Title level={3} className="!mb-0 !text-[30px]">
                Chọn phiên bản
              </Typography.Title>
              <Typography.Text type="secondary">
                {product.variants.length > 0
                  ? `${product.variants.length} biến thể có sẵn, chọn trực tiếp trước khi thêm vào giỏ.`
                  : 'Hiện chưa có biến thể để lựa chọn.'}
              </Typography.Text>
            </div>

            {hasMultipleVariantSlides ? (
              <Space size={8}>
                <Button
                  shape="circle"
                  icon={<LeftOutlined />}
                  aria-label="Xem biến thể trước"
                  disabled={resolvedActiveVariantSlide <= 0}
                  onClick={handleVariantSlidePrev}
                />
                <Button
                  shape="circle"
                  type="primary"
                  ghost
                  icon={<RightOutlined />}
                  aria-label="Xem biến thể tiếp theo"
                  disabled={resolvedActiveVariantSlide >= maxVariantSlideIndex}
                  onClick={handleVariantSlideNext}
                />
              </Space>
            ) : null}
          </div>

          {product.variants.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Hiện chưa có phiên bản sản phẩm"
            />
          ) : (
            <Radio.Group
              value={resolvedSelectedVariantId ?? undefined}
              className="w-full"
              onChange={(event) => {
                const selected = product.variants.find(
                  (variant) => variant.id === String(event.target.value)
                )

                if (selected) {
                  handleSelectVariant(selected)
                }
              }}
            >
              <Carousel
                ref={variantCarouselRef}
                draggable
                dots={hasMultipleVariantSlides}
                infinite={false}
                afterChange={handleVariantCarouselAfterChange}
                className="product-variant-carousel"
              >
                {variantSlides.map((slideVariants, slideIndex) => (
                  <div key={`variant-slide-${slideIndex}`}>
                    <div className={`grid gap-4 pb-2 ${variantGridClassName}`}>
                      {slideVariants.map((variant) => {
                        const image = variant.images[0] ?? product.images[0] ?? PRODUCT_PLACEHOLDER
                        const isSelected = variant.id === resolvedSelectedVariantId
                        const availabilityLabel = getVariantAvailabilityLabel(variant)

                        return (
                          <Radio
                            key={variant.id}
                            value={variant.id}
                            className={`product-variant-picker product-variant-option !m-0 !flex !h-full !w-full rounded-[24px] border bg-white p-4 transition-all duration-200 [&>span:last-child]:flex [&>span:last-child]:w-full [&>span:last-child]:flex-1 ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50/70 shadow-[0_22px_44px_-34px_rgba(37,99,235,0.75)]'
                                : 'border-slate-200 hover:border-blue-300 hover:shadow-[0_18px_36px_-30px_rgba(15,23,42,0.45)]'
                            }`}
                          ><div className="flex h-full w-full flex-col gap-4">
                              <div className="flex items-start gap-4">
                                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl bg-slate-100">
                                  <img
                                    src={image}
                                    alt={`${product.name}-${getVariantLabel(variant)}`}
                                    className="h-full w-full object-cover"
                                  />
                                </div>
                                <div className="min-w-0 flex-1 space-y-2">
                                  <div className="space-y-1">
                                    <Typography.Text
                                      strong
                                      className="block !text-lg !leading-7"
                                    >
                                      {getVariantLabel(variant)}
                                      </Typography.Text>
                                      <Typography.Text
                                      type="secondary"
                                      className="block truncate text-sm"
                                    >
                                      SKU: {variant.sku}
                                    </Typography.Text>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2">
                                    <Tag className="!m-0 !rounded-full !border-0 !bg-slate-100 !px-3 !py-1 !text-xs !text-slate-600">
                                      {variant.color?.trim() || 'Mặc định'}
                                    </Tag>
                                    <Tag className="!m-0 !rounded-full !border-0 !bg-slate-100 !px-3 !py-1 !text-xs !text-slate-600">
                                      {variant.size?.trim() || 'Tiêu chuẩn'}
                                    </Tag>
                                  </div>
                                </div>
                              </div>

                              <div className="mt-auto flex items-end justify-between gap-4 border-t border-slate-100 pt-4">
                                <div className="min-w-0 flex-1">
                                  {renderVariantPrice(variant)}
                                </div>
                                <div className="shrink-0 rounded-full bg-slate-50 px-3 py-1.5 text-sm font-semibold text-slate-700">
                                  Kho: {variant.stockQuantity}
                                </div>
                              </div>

                              <Typography.Text
                                className={`block text-sm font-medium ${
                                  availabilityLabel === 'Còn hàng'
                                    ? 'text-lime-700'
                                    : 'text-slate-500'
                                }`}
                              >
                                {availabilityLabel}
                              </Typography.Text>
            </div>
                          </Radio>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </Carousel>
            </Radio.Group>
          )}
        </div>
      </Card>

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
