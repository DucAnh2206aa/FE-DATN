import { useQuery } from '@tanstack/react-query'
import { Button, Card, message, Result, Space, Spin, Typography } from 'antd'
import { useEffect, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { verifyVnpayReturn, verifyZalopayRedirect } from '@/features/account/api/account.api'
import { ROUTE_PATHS } from '@/shared/constants/routes'
import { formatVndCurrency } from '@/shared/utils/currency'

export const PaymentSuccessPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasRequestedVerification = useRef(false)

  const notifiedSuccessKeyRef = useRef<string | null>(null)
  const notifiedErrorKeyRef = useRef<string | null>(null)

  const vnpPayload = useMemo(() => {
    const payload: Record<string, string> = {}

    searchParams.forEach((value, key) => {
      if (key.startsWith('vnp_')) {
        payload[key] = value
      }
    })

    return payload
  }, [searchParams])

  const hasVnpReturnData =
    Boolean(vnpPayload.vnp_TxnRef) &&
    Boolean(vnpPayload.vnp_SecureHash) &&
    Boolean(vnpPayload.vnp_ResponseCode)

  const zalopayPayload = useMemo(() => {
    const payload: Record<string, string> = {}

    searchParams.forEach((value, key) => {
      if (
        key === 'appid' ||
        key === 'apptransid' ||
        key === 'pmcid' ||
        key === 'bankcode' ||
        key === 'amount' ||
        key === 'discountamount' ||
        key === 'status' ||
        key === 'checksum'
      ) {
        payload[key] = value
      }
    })

    if (!payload.appid || !payload.apptransid || !payload.checksum) {
      return null
    }

    return {
      appid: payload.appid,
      apptransid: payload.apptransid,
      pmcid: payload.pmcid,
      bankcode: payload.bankcode,
      amount: payload.amount,
      discountamount: payload.discountamount,
      status: payload.status,
      checksum: payload.checksum,
    }
  }, [searchParams])

  const hasZalopayReturnData = Boolean(zalopayPayload)


  if (!hasVnpReturnData && !hasZalopayReturnData) {
    return (
      <Card className="mx-auto mt-8 max-w-2xl">
        <Result
          status="warning"
          title="Không có dữ liệu thanh toán"
          subTitle="Liên kết thanh toán không hợp lệ hoặc đã hết hạn."
          extra={
            <Button type="primary" onClick={() => navigate(ROUTE_PATHS.ACCOUNT_ORDERS)}>
              Đến đơn hàng của tôi
            </Button>
          }
        />
      </Card>
    )
  }

<<<<<<< HEAD
  if (verifyMutation.isPending || verifyMutation.isIdle) {
=======
  const activeGateway = hasVnpReturnData ? 'vnpay' : 'zalopay'
  if (!verifyResult || !order) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Space direction="vertical" align="center">
          <Spin size="large" />
<<<<<<< HEAD
          <Typography.Text type="secondary">Đang xác thực giao dịch VNPay...</Typography.Text>
=======
          <Typography.Text type="secondary">
            {activeGateway === 'zalopay'
              ? 'Đang xác thực giao dịch ZaloPay...'
              : 'Đang xác thực giao dịch VNPay...'}
          </Typography.Text>
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
        </Space>
      </div>
    )
  }

<<<<<<< HEAD
  if (verifyMutation.isError) {
=======
  const isVerifyError =
    activeGateway === 'vnpay' ? verifyMutation.isError : verifyZalopayMutation.isError

  if (isVerifyError) {
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
    return (
      <Card className="mx-auto mt-8 max-w-2xl">
        <Result
          status="error"
<<<<<<< HEAD
          title="Không xác thực được giao dịch VNPay"
=======
          title={
            activeGateway === 'zalopay'
              ? 'Không xác thực được giao dịch ZaloPay'
              : 'Không xác thực được giao dịch VNPay'
          }
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
          subTitle="Vui lòng kiểm tra lại đơn hàng của bạn và thử thanh toán lại nếu cần."
          extra={
            <Button type="primary" onClick={() => navigate(ROUTE_PATHS.ACCOUNT_ORDERS)}>
              Đơn hàng của tôi
            </Button>
          }
        />
      </Card>
    )
  }

<<<<<<< HEAD


>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
  return (
    <Card className="mx-auto mt-8 max-w-2xl">
      <Result
        status={isPaymentSuccess ? 'success' : 'error'}
<<<<<<< HEAD
        title={isPaymentSuccess ? 'Thanh toán VNPay thành công' : 'Thanh toán VNPay thất bại'}
=======
        title={
          isPaymentSuccess
            ? activeGateway === 'zalopay'
              ? 'Thanh toán ZaloPay thành công'
              : 'Thanh toán VNPay thành công'
            : activeGateway === 'zalopay'
              ? 'Thanh toán ZaloPay thất bại'
              : 'Thanh toán VNPay thất bại'
        }
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
        subTitle={`Đơn hàng ${order.orderCode} - ${formatVndCurrency(order.totalAmount)}`}
        extra={[
          <Button
            key="orders"
            type="primary"
            onClick={() => {
              navigate(ROUTE_PATHS.ACCOUNT_ORDERS)
            }}
          >
            Đơn hàng của tôi
          </Button>,
          <Button
            key="home"
            onClick={() => {
              navigate(ROUTE_PATHS.ROOT)
            }}
          >
            Về trang chủ
          </Button>,
        ]}
      />
    </Card>
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 995ad3a6158614808e736f65054e934a17d150bf
