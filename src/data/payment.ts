// Төлбөрийн арга, дансны мэдээлэл
// Үндсэн төлбөр: Хаан Банк (Монгол MNT шууд шилжүүлэг)
// Олон улсын: Wise / Payoneer / SWIFT / USDT (нөөц сонголт)

export type PaymentMethod = "qpay" | "bank" | "wise" | "payoneer" | "swift" | "usdt";

export interface PaymentInfo {
  id: PaymentMethod;
  label: string;
  short: string;
  badge: string;
  fields: { key: string; label: string; value: string; copy?: boolean }[];
  notes: string[];
}

export const PREPAYMENT_RATE = 0.3;

export const calcPrepayment = (total: number) => {
  const raw = total * PREPAYMENT_RATE;
  const rounded = Math.ceil(raw / 1000) * 1000;
  return Math.min(rounded, total);
};

export const USD_RATE = 3650;
export const mntToUsd = (mnt: number) => Math.ceil(mnt / USD_RATE);

export const CNY_RATE = 490;
export const mntToCny = (mnt: number) => Math.ceil(mnt / CNY_RATE);
export const formatCNY = (cny: number) => `¥${cny.toLocaleString("en-US")}`;

export const KHAN_BANK = {
  bank: "Хаан Банк",
  account: "5037634064",
  holder: "Дэмбэрэлсамбуу Бямбасүрэн",
  phone: "99577732",
};

type TFn = (key: string, options?: any) => string;

export const getPayments = (t: TFn): Record<PaymentMethod, PaymentInfo> => {
  const arr = (key: string): string[] => {
    const v = t(key, { returnObjects: true }) as unknown;
    return Array.isArray(v) ? (v as string[]) : [];
  };
  return {
    qpay: {
      id: "qpay",
      label: t("payment.qpay.label"),
      short: t("payment.qpay.short"),
      badge: t("payment.qpay.badge"),
      fields: [],
      notes: arr("payment.qpay.notes"),
    },
    bank: {
      id: "bank",
      label: t("payment.bank.label"),
      short: t("payment.bank.short"),
      badge: t("payment.bank.badge"),
      fields: [
        { key: "bank", label: t("payment.bank.fBank"), value: KHAN_BANK.bank, copy: true },
        { key: "account", label: t("payment.bank.fAccount"), value: KHAN_BANK.account, copy: true },
        { key: "holder", label: t("payment.bank.fHolder"), value: KHAN_BANK.holder, copy: true },
        { key: "phone", label: t("payment.bank.fPhone"), value: KHAN_BANK.phone, copy: true },
      ],
      notes: arr("payment.bank.notes"),
    },
    wise: {
      id: "wise",
      label: t("payment.wise.label"),
      short: t("payment.wise.short"),
      badge: t("payment.wise.badge"),
      fields: [
        { key: "email", label: t("payment.wise.fEmail"), value: "ubskins@wise.com", copy: true },
        { key: "name", label: t("payment.wise.fName"), value: "UBSkins LLC", copy: true },
        { key: "currency", label: t("payment.wise.fCurrency"), value: "USD" },
      ],
      notes: arr("payment.wise.notes"),
    },
    payoneer: {
      id: "payoneer",
      label: t("payment.payoneer.label"),
      short: t("payment.payoneer.short"),
      badge: t("payment.payoneer.badge"),
      fields: [
        { key: "email", label: t("payment.payoneer.fEmail"), value: "pay@ubskins.mn", copy: true },
        { key: "name", label: t("payment.payoneer.fName"), value: "UBSkins LLC", copy: true },
      ],
      notes: arr("payment.payoneer.notes"),
    },
    swift: {
      id: "swift",
      label: t("payment.swift.label"),
      short: t("payment.swift.short"),
      badge: t("payment.swift.badge"),
      fields: [
        { key: "bank", label: t("payment.swift.fBank"), value: "Khan Bank", copy: true },
        { key: "swift", label: t("payment.swift.fSwift"), value: "AGMOMNUB", copy: true },
        { key: "iban", label: t("payment.swift.fIban"), value: "5001234567 (USD)", copy: true },
        { key: "name", label: t("payment.swift.fName"), value: "UBSkins LLC", copy: true },
      ],
      notes: arr("payment.swift.notes"),
    },
    usdt: {
      id: "usdt",
      label: t("payment.usdt.label"),
      short: t("payment.usdt.short"),
      badge: t("payment.usdt.badge"),
      fields: [
        { key: "network", label: t("payment.usdt.fNetwork"), value: "TRON (TRC-20)", copy: true },
        { key: "address", label: t("payment.usdt.fAddress"), value: "TXYZabcdEFGHijklMNOPqrstUVWXyz1234", copy: true },
      ],
      notes: arr("payment.usdt.notes"),
    },
  };
};

// Legacy fallback (MN strings) for code paths that haven't been migrated.
import i18nInstance from "@/i18n";
const _t: TFn = (k, o) => i18nInstance.t(k, o) as string;
export const PAYMENTS: Record<PaymentMethod, PaymentInfo> = new Proxy({} as any, {
  get(_target, prop: string) {
    return getPayments(_t)[prop as PaymentMethod];
  },
  ownKeys() {
    return ["qpay", "bank", "wise", "payoneer", "swift", "usdt"];
  },
  getOwnPropertyDescriptor() {
    return { enumerable: true, configurable: true };
  },
});

export const paymentLabel = (m: string): string =>
  getPayments(_t)[m as PaymentMethod]?.label ?? m.toUpperCase();
