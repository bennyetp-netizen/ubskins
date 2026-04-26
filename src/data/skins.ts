// Скин — database row-той нийцэх type. Бүх өгөгдөл Supabase-ээс ирнэ.
export type Wear = "FN" | "MW" | "FT" | "WW" | "BS";
export type Weapon = "Rifle" | "Sniper" | "Knife" | "Pistol" | "SMG";
export type Rarity = "Covert" | "Classified" | "Restricted" | "Mil-Spec";

export interface Skin {
  id: string;
  name: string;
  weapon: string; // Rifle/Sniper/Knife/Pistol/SMG (DB-д text)
  weaponName: string; // AK-47, AWP, ★ Karambit гэх мэт
  wear: Wear;
  float: number;
  price: number; // MNT
  stock: number;
  image: string;
  rarity: Rarity;
  statTrak?: boolean;
  game?: string;
  description?: string | null;
  isActive?: boolean;
  isFeatured?: boolean;
}

// DB row-г UI Skin рүү хөрвүүлэгч
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
}

export const mapSkinRow = (r: SkinRow): Skin => ({
  id: r.id,
  name: r.name,
  weapon: r.weapon,
  weaponName: r.weapon, // weapon талбар нь "AK-47" гэх мэтээр хадгалагдана
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
