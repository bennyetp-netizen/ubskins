// Төлбөрийн арга, дансны мэдээлэл
// Үндсэн төлбөр: Хаан Банк (Монгол MNT шууд шилжүүлэг)
// Олон улсын: Wise / Payoneer / SWIFT / USDT (нөөц сонголт)

export type PaymentMethod = "bank" | "wise" | "payoneer" | "swift" | "usdt";

export interface PaymentInfo {
  id: PaymentMethod;
  label: string;
  short: string;
  badge: string;
  fields: { key: string; label: string; value: string; copy?: boolean }[];
  notes: string[];
}

// 30% урьдчилгаа
export const PREPAYMENT_RATE = 0.3;

export const calcPrepayment = (total: number) => {
  const raw = total * PREPAYMENT_RATE;
  // Round up to nearest 1000, but never exceed total
  const rounded = Math.ceil(raw / 1000) * 1000;
  return Math.min(rounded, total);
};

// USD ханш (тогтмол ойролцоо) - зөвхөн Wise/SWIFT/Payoneer гэх мэт олон улсын төлбөрт ашиглана
export const USD_RATE = 3500;
export const mntToUsd = (mnt: number) => Math.ceil(mnt / USD_RATE);

// CNY (Юань) ханш — BUFF163 нь юань-аар арилждаг тул үндсэн харьцуулалтын валют
// 1 CNY ≈ 490 MNT (ойролцоо, market rate-аас хамаарч өөрчлөгдөнө)
export const CNY_RATE = 490;
export const mntToCny = (mnt: number) => Math.ceil(mnt / CNY_RATE);
export const formatCNY = (cny: number) => `¥${cny.toLocaleString("en-US")}`;

// Хаан банкны дансны мэдээлэл
export const KHAN_BANK = {
  bank: "Хаан Банк",
  account: "5037634064",
  holder: "Дэмбэрэлсамбуу Бямбасүрэн",
  phone: "99577732",
};

export const PAYMENTS: Record<PaymentMethod, PaymentInfo> = {
  bank: {
    id: "bank",
    label: "Хаан Банк (MNT)",
    short: "Хаан Банк",
    badge: "Шуурхай · Монголд тохиромжтой",
    fields: [
      { key: "bank", label: "Банк", value: KHAN_BANK.bank, copy: true },
      { key: "account", label: "Дансны дугаар", value: KHAN_BANK.account, copy: true },
      { key: "holder", label: "Хүлээн авагч", value: KHAN_BANK.holder, copy: true },
      { key: "phone", label: "Утас", value: KHAN_BANK.phone, copy: true },
    ],
    notes: [
      "Хаан банкны апп-аас доорх дансруу шилжүүлнэ үү.",
      "Гүйлгээний утга дээр заавал захиалгын дугаараа (UBS-XXX) бичнэ — тохирохгүй бол захиалга баталгаажихгүй.",
      "Шилжүүлсэн screenshot-ыг @ubskins Telegram руу илгээнэ.",
    ],
  },
  wise: {
    id: "wise",
    label: "Wise (TransferWise)",
    short: "Wise",
    badge: "Олон улсын · 1-2 өдөр",
    fields: [
      { key: "email", label: "Wise email", value: "ubskins@wise.com", copy: true },
      { key: "name", label: "Хүлээн авагч", value: "UBSkins LLC", copy: true },
      { key: "currency", label: "Валют", value: "USD" },
    ],
    notes: [
      "Reference дээр захиалгын дугаараа (UBS-XXX) заавал бичнэ үү.",
    ],
  },
  payoneer: {
    id: "payoneer",
    label: "Payoneer",
    short: "Payoneer",
    badge: "Олон улсын · USD",
    fields: [
      { key: "email", label: "Payoneer email", value: "pay@ubskins.mn", copy: true },
      { key: "name", label: "Хүлээн авагч", value: "UBSkins LLC", copy: true },
    ],
    notes: ["Шимтгэл ~1% орчим."],
  },
  swift: {
    id: "swift",
    label: "SWIFT шилжүүлэг",
    short: "SWIFT",
    badge: "Олон улсын · 2-5 өдөр",
    fields: [
      { key: "bank", label: "Банк", value: "Khan Bank", copy: true },
      { key: "swift", label: "SWIFT/BIC", value: "AGMOMNUB", copy: true },
      { key: "iban", label: "Дансны дугаар", value: "5001234567 (USD)", copy: true },
      { key: "name", label: "Хүлээн авагч", value: "UBSkins LLC", copy: true },
    ],
    notes: ["Шимтгэл 25-50 USD орчим."],
  },
  usdt: {
    id: "usdt",
    label: "USDT (TRC-20)",
    short: "USDT",
    badge: "Крипто · хурдан",
    fields: [
      { key: "network", label: "Сүлжээ", value: "TRON (TRC-20)", copy: true },
      { key: "address", label: "Хаяг", value: "TXYZabcdEFGHijklMNOPqrstUVWXyz1234", copy: true },
    ],
    notes: ["Сүлжээ заавал TRC-20 байх ёстой."],
  },
};

export const paymentLabel = (m: string): string =>
  PAYMENTS[m as PaymentMethod]?.label ?? m.toUpperCase();
