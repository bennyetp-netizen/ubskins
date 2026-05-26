/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
  Button,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface OrderItem {
  name: string
  price: number
  wear?: string
}

interface OrderConfirmationProps {
  orderNumber?: string
  customerName?: string
  items?: OrderItem[]
  total?: number
  depositAmount?: number
  paymentMethod?: string
  ordersUrl?: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat('mn-MN').format(Math.round(n)) + '₮'

const OrderConfirmation = ({
  orderNumber = 'UBS-000',
  customerName = '',
  items = [],
  total = 0,
  depositAmount = 0,
  paymentMethod = 'bank',
  ordersUrl = 'https://ubskins.mn/orders',
}: OrderConfirmationProps) => (
  <Html>
    <Head />
    <Preview>Захиалга {orderNumber} баталгаажлаа — UBSkins</Preview>
    <Body style={body}>
      <Container style={container}>
        <Heading style={h1}>UBSkins</Heading>
        <Text style={text}>
          Сайн байна уу{customerName ? ` ${customerName}` : ''},
        </Text>
        <Text style={text}>
          Таны захиалгыг хүлээн авлаа. Захиалгын дугаар:{' '}
          <strong>{orderNumber}</strong>
        </Text>

        <Section style={card}>
          <Heading as="h2" style={h2}>Захиалсан скинүүд</Heading>
          {items.map((it, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Text style={itemName}>{it.name}</Text>
              {it.wear && <Text style={itemMeta}>{it.wear}</Text>}
              <Text style={itemPrice}>{fmt(it.price)}</Text>
            </div>
          ))}
          <Hr style={hr} />
          <Text style={totalRow}>
            <strong>Нийт:</strong> {fmt(total)}
          </Text>
          {depositAmount > 0 && depositAmount < total && (
            <Text style={totalRow}>
              <strong>Урьдчилгаа (30%):</strong> {fmt(depositAmount)}
            </Text>
          )}
        </Section>

        <Text style={text}>
          Төлбөрийн арга: <strong>{paymentMethod === 'qpay' ? 'QPay' : 'Хаан банк'}</strong>
        </Text>
        <Text style={text}>
          Төлбөрийн зааврыг доорх товчоор үзнэ үү:
        </Text>

        <Section style={{ textAlign: 'center', margin: '24px 0' }}>
          <Button href={ordersUrl} style={button}>
            Захиалгаа харах
          </Button>
        </Section>

        <Hr style={hr} />
        <Text style={footer}>
          Асуух зүйл байвал энэ имэйлд хариулна уу.
          <br />
          UBSkins — ubskins.mn
        </Text>
      </Container>
    </Body>
  </Html>
)

const body = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }
const h1 = { color: '#0F172A', fontSize: '28px', fontWeight: 700, margin: '0 0 24px' }
const h2 = { color: '#0F172A', fontSize: '16px', fontWeight: 600, margin: '0 0 12px' }
const text = { color: '#334155', fontSize: '15px', lineHeight: '24px', margin: '0 0 12px' }
const card = { backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '20px', margin: '20px 0' }
const itemName = { color: '#0F172A', fontSize: '14px', fontWeight: 600, margin: 0 }
const itemMeta = { color: '#64748B', fontSize: '12px', margin: '2px 0' }
const itemPrice = { color: '#0F172A', fontSize: '14px', margin: '2px 0 8px' }
const totalRow = { color: '#0F172A', fontSize: '15px', margin: '6px 0' }
const hr = { borderColor: '#E2E8F0', margin: '16px 0' }
const button = { backgroundColor: '#0F172A', color: '#ffffff', padding: '12px 24px', borderRadius: '8px', textDecoration: 'none', fontSize: '14px', fontWeight: 600 }
const footer = { color: '#64748B', fontSize: '12px', lineHeight: '18px', marginTop: '24px' }

export const template = {
  component: OrderConfirmation,
  subject: (d: OrderConfirmationProps) =>
    `Захиалга ${d?.orderNumber ?? ''} баталгаажлаа — UBSkins`,
  displayName: 'Захиалгын баталгаажуулалт',
  previewData: {
    orderNumber: 'UBS-001',
    customerName: 'Болд',
    items: [{ name: 'AK-47 | Redline', price: 250000, wear: 'Field-Tested' }],
    total: 250000,
    depositAmount: 250000,
    paymentMethod: 'bank',
    ordersUrl: 'https://ubskins.mn/orders',
  },
} satisfies TemplateEntry
