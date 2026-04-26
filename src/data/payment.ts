// Олон улсын төлбөрийн арга, дансны мэдээлэл
// Эдгээрийг өөрийн жинхэнэ дансны мэдээллээр солино уу.

export type PaymentMethod = "wise" | "payoneer" | "swift" | "usdt";

export interface PaymentInfo {
  id: PaymentMethod;
  label: string;
  short: string;
  badge: string; // hint
  fields: { key: string; label: string; value: string; copy?: boolean }[];
  notes: string[];
}

// 30% урьдчилгаа
export const PREPAYMENT_RATE = 0.3;

export const calcPrepayment = (total: number) =>
  Math.ceil((total * PREPAYMENT_RATE) / 1000) * 1000;

// USD ханш (тогтмол ойролцоо. Дараа нь admin талаас өөрчилж болно)
export const USD_RATE = 3500; // 1 USD ≈ 3,500₮

export const mntToUsd = (mnt: number) => Math.ceil(mnt / USD_RATE);

export const PAYMENTS: Record<PaymentMethod, PaymentInfo> = {
  wise: {
    id: "wise",
    label: "Wise (TransferWise)",
    short: "Wise",
    badge: "Хямд шимтгэл · 1-2 өдөр",
    fields: [
      { key: "email", label: "Wise email", value: "ubskins@wise.com", copy: true },
      { key: "name", label: "Хүлээн авагч", value: "UBSkins LLC", copy: true },
      { key: "currency", label: "Валют", value: "USD" },
    ],
    notes: [
      "Wise.com-оор Монголоос Visa/Mastercard-аар шууд төлбөр илгээх боломжтой.",
      "Reference хэсэгт захиалгын дугаараа заавал бичнэ үү.",
      "Шилжүүлсэн screenshot-ыг /orders хуудаснаас upload хийнэ.",
    ],
  },
  payoneer: {
    id: "payoneer",
    label: "Payoneer",
    short: "Payoneer",
    badge: "Монголд тохиромжтой · USD",
    fields: [
      { key: "email", label: "Payoneer email", value: "pay@ubskins.mn", copy: true },
      { key: "name", label: "Хүлээн авагч", value: "UBSkins LLC", copy: true },
    ],
    notes: [
      "Payoneer аппликейшн дотроос 'Make a Payment' сонгож илгээнэ.",
      "Шимтгэл ~1% орчим.",
    ],
  },
  swift: {
    id: "swift",
    label: "SWIFT банкны шилжүүлэг",
    short: "SWIFT",
    badge: "Уламжлалт · 2-5 өдөр",
    fields: [
      { key: "bank", label: "Банк", value: "Khan Bank", copy: true },
      { key: "swift", label: "SWIFT/BIC", value: "AGMOMNUB", copy: true },
      { key: "iban", label: "Дансны дугаар", value: "5001234567 (USD)", copy: true },
      { key: "name", label: "Хүлээн авагч", value: "UBSkins LLC", copy: true },
      { key: "address", label: "Хаяг", value: "Ulaanbaatar, Mongolia" },
    ],
    notes: [
      "Голомт, Хаан, ХХБ-ний онлайн банкаар олон улсын шилжүүлэг хийгдэнэ.",
      "Шимтгэл 25-50 USD орчим тул ≥500₮сая захиалгад тохиромжтой.",
    ],
  },
  usdt: {
    id: "usdt",
    label: "USDT (TRC-20)",
    short: "USDT",
    badge: "Хурдан · Шимтгэл бараг үгүй",
    fields: [
      { key: "network", label: "Сүлжээ", value: "TRON (TRC-20)", copy: true },
      { key: "address", label: "Хаяг", value: "TXYZabcdEFGHijklMNOPqrstUVWXyz1234", copy: true },
    ],
    notes: [
      "Binance, Bybit, OKX зэрэг exchange-ээс TRC-20 сүлжээгээр илгээнэ.",
      "Сүлжээгээ заавал TRC-20 сонгоно (ERC-20 биш!) — буруу сүлжээгээр илгээвэл алдагдана.",
      "Шилжсэн TX hash-аа /orders хуудсанд оруулна.",
    ],
  },
};

export const paymentLabel = (m: string): string =>
  PAYMENTS[m as PaymentMethod]?.label ?? m.toUpperCase();
