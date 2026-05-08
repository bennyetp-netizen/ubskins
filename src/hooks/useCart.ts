import { useEffect, useState } from "react";
import type { Skin } from "@/data/skins";

const KEY = "skinhub-cart";

export type FloatPreferenceTier = "cheapest" | "clean" | "very_clean";

export interface CartPreferences {
  floatPreference: FloatPreferenceTier;
  priceAdjustmentPct: number; // 0, 5, 10
  exactFloatRequest?: string;
  stickerRequest?: string;
}

export interface CartItem {
  skin: Skin; // skin.price reflects adjusted final price
  preferences?: CartPreferences;
  lineId: string; // unique per cart line
}

const read = (): CartItem[] => {
  try {
    const raw: any[] = JSON.parse(localStorage.getItem(KEY) || "[]");
    return raw.map((i, idx) => ({
      ...i,
      lineId: i.lineId ?? `${i.skin?.id ?? "x"}-${idx}`,
    }));
  } catch {
    return [];
  }
};

const DEFAULT_PREFS: CartPreferences = {
  floatPreference: "cheapest",
  priceAdjustmentPct: 0,
};

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    setItems(read());
    const onStorage = () => setItems(read());
    window.addEventListener("storage", onStorage);
    window.addEventListener("cart:updated", onStorage);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cart:updated", onStorage);
    };
  }, []);

  const persist = (next: CartItem[]) => {
    localStorage.setItem(KEY, JSON.stringify(next));
    setItems(next);
    window.dispatchEvent(new Event("cart:updated"));
  };

  const add = (skin: Skin, preferences: CartPreferences = DEFAULT_PREFS) => {
    const adjustedPrice = Math.round(skin.price * (1 + preferences.priceAdjustmentPct / 100));
    const adjustedSkin: Skin = { ...skin, price: adjustedPrice };
    const lineId = `${skin.id}-${preferences.floatPreference}-${preferences.exactFloatRequest ?? ""}-${preferences.stickerRequest ?? ""}-${Date.now()}`;
    // dedupe identical preference for same skin
    if (items.find((i) =>
      i.skin.id === skin.id &&
      i.preferences?.floatPreference === preferences.floatPreference &&
      (i.preferences?.exactFloatRequest ?? "") === (preferences.exactFloatRequest ?? "") &&
      (i.preferences?.stickerRequest ?? "") === (preferences.stickerRequest ?? "")
    )) return;
    persist([...items, { skin: adjustedSkin, preferences, lineId }]);
  };

  const remove = (lineId: string) => persist(items.filter((i) => i.lineId !== lineId));
  const clear = () => persist([]);

  const total = items.reduce((s, i) => s + i.skin.price, 0);
  return { items, add, remove, clear, total };
}
