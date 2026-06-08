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

// Selling price = cost × tiered markup, rounded to nearest 100 MNT.
// 0 - 50,000        → +15%
// 50,001 - 200,000  → +12%
// > 200,000         → +8%
// NOTE: Cost prices are stored in the admin-only `skin_costs` table and
// never reach the customer-facing client. `price_mnt` on `skins` is the
// already-calculated selling price.
export const calcSellingPrice = (costMnt: number): number => {
  const markup = costMnt <= 50000 ? 1.15 : costMnt <= 200000 ? 1.12 : 1.08;
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
