// Скин — database row-той нийцэх type. Бүх өгөгдөл Supabase-ээс ирнэ.
export type Wear = "FN" | "MW" | "FT" | "WW" | "BS";
export type Weapon = "Rifle" | "Sniper" | "Knife" | "Pistol" | "SMG" | "Shotgun" | "Heavy" | "Gloves";
export type Rarity = "Covert" | "Classified" | "Restricted" | "Mil-Spec";

export type ProductType = "ready" | "preorder";

export interface Skin {
  id: string;
  name: string;
  weapon: string;
  weaponName: string;
  wear: Wear;
  float: number;
  price: number; // MNT (selling price shown to customers)
  
  stock: number;
  image: string;
  rarity: Rarity;
  statTrak?: boolean;
  game?: string;
  description?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
  productType: ProductType;
  stockQuantity: number;
}

export interface SkinRow {
  id: string;
  name: string;
  weapon: string;
  game: string;
  wear: string | null;
  float_value: number | null;
  price_mnt: number;
  image_url: string | null;
  rarity: string | null;
  description: string | null;
  stattrak: boolean;
  is_active: boolean;
  is_featured: boolean;
  stock: number;
  product_type?: string | null;
  stock_quantity?: number | null;
}

// Selling price calculation — cost_price_mnt is the single source of truth.
// Tiered pricing rules (revised to fix low-margin sub-20k skins):
//   cost <= 20,000           → cost + 3,000 (flat)
//   20,001 - 200,000         → cost * 1.12, rounded to nearest 100 MNT
//   200,001 - 1,000,000      → cost * 1.10, rounded to nearest 100 MNT
//   > 1,000,000              → cost * 1.06, rounded to nearest 100 MNT
// NOTE: cost prices are stored in admin-only `skin_costs` and never reach
// the customer client. `price_mnt` on `skins` is the computed selling price.
export const calcSellingPrice = (costMnt: number): number => {
  if (costMnt <= 20000) return costMnt + 1000;
  const markup = costMnt <= 200000 ? 1.10 : costMnt <= 1000000 ? 1.08 : 1.05;
  return Math.round((costMnt * markup) / 100) * 100;
};

export const mapSkinRow = (r: SkinRow): Skin => ({
  id: r.id,
  name: r.name,
  weapon: r.weapon,
  weaponName: r.weapon,
  wear: (r.wear as Wear) ?? "FT",
  float: r.float_value ?? 0,
  price: r.price_mnt,
  stock: r.stock,
  image: r.image_url ?? "/placeholder.svg",
  rarity: (r.rarity as Rarity) ?? "Mil-Spec",
  statTrak: r.stattrak,
  game: r.game,
  description: r.description,
  isActive: r.is_active,
  isFeatured: r.is_featured,
  productType: ((r.product_type as ProductType) ?? "preorder"),
  stockQuantity: r.stock_quantity ?? 0,
});

export const wearLabel: Record<Wear, string> = {
  FN: "Factory New",
  MW: "Minimal Wear",
  FT: "Field-Tested",
  WW: "Well-Worn",
  BS: "Battle-Scarred",
};

export const wearColor: Record<Wear, string> = {
  FN: "text-wear-fn",
  MW: "text-wear-mw",
  FT: "text-wear-ft",
  WW: "text-wear-ww",
  BS: "text-wear-bs",
};

export const formatMNT = (n: number) =>
  new Intl.NumberFormat("mn-MN").format(n) + "₮";

export const storepayMonthly = (price: number) =>
  Math.ceil(price / 4 / 1000) * 1000;
