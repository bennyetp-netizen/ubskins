/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface AdminOrderItem { name: string; price: number; wear?: string }
interface AdminOrderProps {
  orderNumber?: string
  customerEmail?: string
  customerPhone?: string
  customerName?: string
  items?: AdminOrderItem[]
  total?: number
  depositAmount?: number
  paymentMethod?: string
  adminUrl?: string
}

const fmt = (n: number) =>
  new Intl.NumberFormat('mn-MN').format(Math.round(n)) + '₮'

const AdminOrderNotification = ({
  orderNumber = 'UBS-000',
  customerEmail = '',
  customerPhone = '',
  customerName = '',
  items = [],
  total = 0,
  depositAmount = 0,
  paymentMethod = 'bank',
  adminUrl = 'https://ubskins.mn/admin',
}: AdminOrderProps) => (
  <Html>
    <Head />
    <Preview>Шинэ захиалга {orderNumber} — {fmt(total)}</Preview>
    <Body style={body}>
      <Container style={container}>
        <Heading style={h1}>🛒 Шинэ захиалга</Heading>
        <Text style={text}>
          Дугаар: <strong>{orderNumber}</strong>
        </Text>

        <Section style={card}>
          <Heading as="h2" style={h2}>Хэрэглэгч</Heading>
          {customerName && <Text style={row}>Нэр: {customerName}</Text>}
          <Text style={row}>И-мэйл: {customerEmail}</Text>
          <Text style={row}>Утас: {customerPhone}</Text>
        </Section>

        <Section style={card}>
          <Heading as="h2" style={h2}>Скинүүд</Heading>
          {items.map((it, i) => (
            <div key={i} style={{ marginBottom: 8 }}>
              <Text style={itemName}>{it.name}</Text>
              {it.wear && <Text style={itemMeta}>{it.wear}</Text>}
              <Text style={itemPrice}>{fmt(it.price)}</Text>
            </div>
          ))}
          <Hr style={hr} />
          <Text style={row}><strong>Нийт:</strong> {fmt(total)}</Text>
          {depositAmount > 0 && depositAmount < total && (
            <Text style={row}><strong>Урьдчилгаа:</strong> {fmt(depositAmount)}</Text>
          )}
          <Text style={row}>Төлбөр: <strong>{paymentMethod === 'qpay' ? 'QPay' : 'Хаан банк'}</strong></Text>
        </Section>

        <Text style={text}>
          Админ хэсэг: <a href={adminUrl} style={link}>{adminUrl}</a>
        </Text>
      </Container>
    </Body>
  </Html>
)

const body = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif', margin: 0, padding: 0 }
const container = { maxWidth: '560px', margin: '0 auto', padding: '32px 24px' }
const h1 = { color: '#0F172A', fontSize: '24px', fontWeight: 700, margin: '0 0 16px' }
const h2 = { color: '#0F172A', fontSize: '15px', fontWeight: 600, margin: '0 0 10px' }
const text = { color: '#334155', fontSize: '14px', lineHeight: '22px', margin: '0 0 12px' }
const card = { backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '12px', padding: '16px', margin: '16px 0' }
const row = { color: '#0F172A', fontSize: '14px', margin: '4px 0' }
const itemName = { color: '#0F172A', fontSize: '14px', fontWeight: 600, margin: 0 }
const itemMeta = { color: '#64748B', fontSize: '12px', margin: '2px 0' }
const itemPrice = { color: '#0F172A', fontSize: '14px', margin: '2px 0 8px' }
const hr = { borderColor: '#E2E8F0', margin: '12px 0' }
const link = { color: '#0F172A', textDecoration: 'underline' }

export const template = {
  component: AdminOrderNotification,
  subject: (d: AdminOrderProps) =>
    `🛒 Шинэ захиалга ${d?.orderNumber ?? ''} — ${fmt(d?.total ?? 0)}`,
  displayName: 'Админд захиалга мэдэгдэх',
  to: 'bennyetp@gmail.com',
  previewData: {
    orderNumber: 'UBS-001',
    customerEmail: 'buyer@example.com',
    customerPhone: '9911-2233',
    customerName: 'Болд',
    items: [{ name: 'AK-47 | Redline', price: 250000, wear: 'Field-Tested · Float 0.150' }],
    total: 250000,
    depositAmount: 250000,
    paymentMethod: 'bank',
    adminUrl: 'https://ubskins.mn/admin',
  },
} satisfies TemplateEntry
