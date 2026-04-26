import akImg from "@/assets/skin-ak.png";
import awpImg from "@/assets/skin-awp.png";
import knifeImg from "@/assets/skin-knife.png";
import m4Img from "@/assets/skin-m4.png";

export type Wear = "FN" | "MW" | "FT" | "WW" | "BS";
export type Weapon = "Rifle" | "Sniper" | "Knife" | "Pistol" | "SMG";

export interface Skin {
  id: string;
  name: string;
  weapon: Weapon;
  weaponName: string;
  wear: Wear;
  float: number;
  price: number; // MNT
  stock: number;
  image: string;
  rarity: "Covert" | "Classified" | "Restricted" | "Mil-Spec";
  statTrak?: boolean;
}

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

export const skins: Skin[] = [
  {
    id: "ak-redline-mw",
    name: "Redline",
    weapon: "Rifle",
    weaponName: "AK-47",
    wear: "MW",
    float: 0.124,
    price: 285000,
    stock: 3,
    image: akImg,
    rarity: "Classified",
    statTrak: true,
  },
  {
    id: "awp-asiimov-ft",
    name: "Asiimov",
    weapon: "Sniper",
    weaponName: "AWP",
    wear: "FT",
    float: 0.281,
    price: 412000,
    stock: 2,
    image: awpImg,
    rarity: "Covert",
  },
  {
    id: "karambit-fade-fn",
    name: "Fade",
    weapon: "Knife",
    weaponName: "★ Karambit",
    wear: "FN",
    float: 0.012,
    price: 4280000,
    stock: 1,
    image: knifeImg,
    rarity: "Covert",
  },
  {
    id: "m4-neon-ft",
    name: "Neon Revolution",
    weapon: "Rifle",
    weaponName: "M4A4",
    wear: "FT",
    float: 0.215,
    price: 198000,
    stock: 5,
    image: m4Img,
    rarity: "Covert",
  },
  {
    id: "ak-redline-ft",
    name: "Redline",
    weapon: "Rifle",
    weaponName: "AK-47",
    wear: "FT",
    float: 0.224,
    price: 245000,
    stock: 7,
    image: akImg,
    rarity: "Classified",
  },
  {
    id: "awp-asiimov-ww",
    name: "Asiimov",
    weapon: "Sniper",
    weaponName: "AWP",
    wear: "WW",
    float: 0.412,
    price: 358000,
    stock: 4,
    image: awpImg,
    rarity: "Covert",
  },
  {
    id: "m4-neon-mw",
    name: "Neon Revolution",
    weapon: "Rifle",
    weaponName: "M4A4",
    wear: "MW",
    float: 0.098,
    price: 268000,
    stock: 2,
    image: m4Img,
    rarity: "Covert",
    statTrak: true,
  },
  {
    id: "karambit-fade-mw",
    name: "Fade",
    weapon: "Knife",
    weaponName: "★ Karambit",
    wear: "MW",
    float: 0.085,
    price: 3850000,
    stock: 1,
    image: knifeImg,
    rarity: "Covert",
  },
];

export const formatMNT = (n: number) =>
  new Intl.NumberFormat("mn-MN").format(n) + "₮";

export const storepayMonthly = (price: number) =>
  Math.ceil(price / 4 / 1000) * 1000;
