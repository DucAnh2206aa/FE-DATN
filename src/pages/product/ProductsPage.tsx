import { useQuery } from '@tanstack/react-query'
import {
  Button,
  Card,
<<<<<<< HEAD
=======
  Checkbox,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  Col,
  Empty,
  Pagination,
  Radio,
  Row,
<<<<<<< HEAD
  Select,
=======
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  Space,
  Spin,
  Typography,
} from 'antd'
import { useSearchParams } from 'react-router-dom'

import { getProductFilters, getProducts } from '@/features/product/api/product.api'
import { ProductCard } from '@/features/product/components/ProductCard'
import { queryKeys } from '@/shared/api/queryKeys'

<<<<<<< HEAD
const PAGE_SIZE = 12
=======
const PAGE_SIZE = 8

const PRICE_RANGES = [
  { value: '0-2000000', label: 'Dưới 2.000.000đ' },
  { value: '2000000-5000000', label: '2.000.000đ - 5.000.000đ' },
  { value: '5000000-10000000', label: '5.000.000đ - 10.000.000đ' },
  { value: '10000000-20000000', label: '10.000.000đ - 20.000.000đ' },
  { value: '20000000-', label: 'Trên 20.000.000đ' },
]
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf

export const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()

  const categoryId = searchParams.get('categoryId')?.trim() ?? ''
  const brand = searchParams.get('brand')?.trim() ?? ''
<<<<<<< HEAD
=======
  const selectedBrands = brand ? brand.split(',').map((item) => item.trim()).filter(Boolean) : []
  const selectedColorIds = (searchParams.get('colorIds') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
  const selectedPriceRanges = (searchParams.get('priceRanges') ?? '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  const search = searchParams.get('search')?.trim() ?? ''
  const page = Number(searchParams.get('page') ?? '1')
  const currentPage = Number.isFinite(page) && page > 0 ? page : 1

  const filtersQuery = useQuery({
    queryKey: queryKeys.products.filters,
    queryFn: getProductFilters,
  })

  const productsQuery = useQuery({
    queryKey: queryKeys.products.list({
      page: currentPage,
      limit: PAGE_SIZE,
      categoryId,
      brand,
<<<<<<< HEAD
=======
      colorIds: selectedColorIds,
      priceRanges: selectedPriceRanges,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
      search,
      isAvailable: true,
    }),
    queryFn: () =>
      getProducts({
        page: currentPage,
        limit: PAGE_SIZE,
        categoryId: categoryId || undefined,
<<<<<<< HEAD
        brand: brand || undefined,
=======
        brand: selectedBrands.length > 0 ? selectedBrands.join(',') : undefined,
        colorIds: selectedColorIds,
        priceRanges: selectedPriceRanges,
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
        search: search || undefined,
        isAvailable: true,
      }),
  })

  const selectedCategoryValue = categoryId || 'all'
<<<<<<< HEAD
  const selectedBrandValue = brand || 'all'
  const categories = filtersQuery.data?.categories ?? []
  const brands = filtersQuery.data?.brands ?? []

  const handleFilterChange = (next: { categoryId?: string; brand?: string; page?: string }) => {
    const params = new URLSearchParams(searchParams)

    const nextCategoryId = next.categoryId ?? categoryId
    const nextBrand = next.brand ?? brand
=======
  const categories = filtersQuery.data?.categories ?? []
  const brands = filtersQuery.data?.brands ?? []
  const colors = filtersQuery.data?.colors ?? []

  const handleFilterChange = (next: {
    categoryId?: string
    brands?: string[]
    colorIds?: string[]
    priceRanges?: string[]
    page?: string
  }) => {
    const params = new URLSearchParams(searchParams)

    const nextCategoryId = next.categoryId ?? categoryId
    const nextBrands = next.brands ?? selectedBrands
    const nextColorIds = next.colorIds ?? selectedColorIds
    const nextPriceRanges = next.priceRanges ?? selectedPriceRanges
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    const nextPage = next.page ?? '1'

    if (nextCategoryId) {
      params.set('categoryId', nextCategoryId)
    } else {
      params.delete('categoryId')
    }

<<<<<<< HEAD
    if (nextBrand) {
      params.set('brand', nextBrand)
=======
    if (nextBrands.length > 0) {
      params.set('brand', nextBrands.join(','))
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    } else {
      params.delete('brand')
    }

<<<<<<< HEAD
=======
    if (nextColorIds.length > 0) {
      params.set('colorIds', nextColorIds.join(','))
    } else {
      params.delete('colorIds')
    }

    if (nextPriceRanges.length > 0) {
      params.set('priceRanges', nextPriceRanges.join(','))
    } else {
      params.delete('priceRanges')
    }

>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    if (search) {
      params.set('search', search)
    } else {
      params.delete('search')
    }

    params.set('page', nextPage)
    setSearchParams(params)
  }

  const selectedCategoryName =
    categories.find((item) => item.id === categoryId)?.name ?? 'Tất cả danh mục'
<<<<<<< HEAD
  const selectedBrandName = brand || 'Tất cả thương hiệu'
  const summaryText = `${selectedCategoryName} • ${selectedBrandName}`
=======
  const selectedBrandName =
    selectedBrands.length > 0 ? `${selectedBrands.length} thương hiệu` : 'Tất cả thương hiệu'
  const selectedColorName =
    selectedColorIds.length > 0 ? `${selectedColorIds.length} màu` : 'Tất cả màu'
  const selectedPriceName =
    selectedPriceRanges.length > 0 ? `${selectedPriceRanges.length} mức giá` : 'Tất cả giá'
  const summaryText = `${selectedCategoryName} • ${selectedBrandName} • ${selectedColorName} • ${selectedPriceName}`
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf

  return (
    <div className="space-y-6 py-6">
      <Typography.Title level={2} className="!mb-0">
        Sản phẩm
      </Typography.Title>

      <Row gutter={[20, 20]} align="top">
        <Col xs={24} lg={7} xl={6}>
          <Card title="Bộ lọc sản phẩm" className="sticky top-24">
            <Space direction="vertical" size="large" className="w-full">
              <div>
                <Typography.Text strong>Danh mục</Typography.Text>
                <Radio.Group
                  className="mt-3 flex w-full flex-col gap-2"
                  value={selectedCategoryValue}
                  onChange={(event) => {
                    handleFilterChange({
                      categoryId: event.target.value === 'all' ? '' : String(event.target.value),
                    })
                  }}
                >
                  <Radio value="all">Tất cả danh mục</Radio>
                  {categories.map((item) => (
                    <Radio key={item.id} value={item.id}>
                      {item.name}
                    </Radio>
                  ))}
                </Radio.Group>
              </div>

              <div>
                <Typography.Text strong>Thương hiệu</Typography.Text>
<<<<<<< HEAD
                <Select
                  className="mt-3 w-full"
                  value={selectedBrandValue}
                  onChange={(value) => {
                    handleFilterChange({
                      brand: value === 'all' ? '' : String(value),
                    })
                  }}
                  options={[
                    { label: 'Tất cả thương hiệu', value: 'all' },
                    ...brands.map((item) => ({ label: item, value: item })),
                  ]}
                />
=======
                <Checkbox.Group
                  className="mt-3 flex w-full flex-col gap-2"
                  value={selectedBrands}
                  onChange={(values) => {
                    handleFilterChange({
                      brands: values.map((value) => String(value)),
                    })
                  }}
                  >
                  {brands.map((item) => (
                    <Checkbox key={item} value={item}>
                      {item}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </div>
<div>
                <Typography.Text strong>Màu sắc</Typography.Text>
                <Checkbox.Group
                  className="mt-3 flex w-full flex-col gap-2"
                  value={selectedColorIds}
                  onChange={(values) => {
                    handleFilterChange({
                      colorIds: values.map((value) => String(value)),
                    })
                  }}
                >
                  {colors.map((item) => (
                    <Checkbox key={item.id} value={item.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full border border-slate-200"
                          style={{ backgroundColor: item.hexCode || '#e2e8f0' }}
                        />
                        {item.name}
                      </span>
                    </Checkbox>
                  ))}
                </Checkbox.Group>
              </div>

              <div>
                <Typography.Text strong>Khoảng giá</Typography.Text>
                <Checkbox.Group
                  className="mt-3 flex w-full flex-col gap-2"
                  value={selectedPriceRanges}
                  onChange={(values) => {
                    handleFilterChange({
                      priceRanges: values.map((value) => String(value)),
                    })
                  }}
                >
                  {PRICE_RANGES.map((range) => (
                    <Checkbox key={range.value} value={range.value}>
                      {range.label}
                    </Checkbox>
                  ))}
                </Checkbox.Group>
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
              </div>

              <Button
                onClick={() => {
                  const params = new URLSearchParams(searchParams)
                  params.delete('categoryId')
                  params.delete('brand')
<<<<<<< HEAD
=======
                  params.delete('colorIds')
                  params.delete('priceRanges')
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
                  params.delete('page')
                  setSearchParams(params)
                }}
              >
                Xóa bộ lọc
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={17} xl={18}>
          <Space direction="vertical" size="middle" className="w-full">
            <Typography.Text type="secondary">
              Bộ lọc hiện tại: {summaryText}
            </Typography.Text>

            {productsQuery.isLoading ? (
              <div className="py-16 text-center">
                <Spin size="large" />
              </div>
            ) : null}

            {!productsQuery.isLoading && (productsQuery.data?.items.length ?? 0) === 0 ? (
              <Card>
                <Empty description="Không tìm thấy sản phẩm phù hợp" />
              </Card>
            ) : null}

            <Row gutter={[16, 16]}>
              {(productsQuery.data?.items ?? []).map((product) => (
<<<<<<< HEAD
                <Col key={product.id} xs={24} sm={12} xl={8}>
=======
                <Col key={product.id} xs={24} sm={12} lg={8} xl={6}>
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
                  <ProductCard product={product} />
                </Col>
              ))}
            </Row>

            {(productsQuery.data?.totalItems ?? 0) > 0 ? (
              <div className="flex justify-end pt-2">
                <Pagination
                  current={currentPage}
                  pageSize={PAGE_SIZE}
                  total={productsQuery.data?.totalItems ?? 0}
                  showSizeChanger={false}
                  onChange={(nextPage) => {
                    handleFilterChange({ page: String(nextPage) })
                  }}
                />
              </div>
            ) : null}
          </Space>
        </Col>
      </Row>
    </div>
  )
}
