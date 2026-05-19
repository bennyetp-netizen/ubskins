import { useEffect, useState } from "react";
import type { Skin } from "@/data/skins";

const KEY = "skinhub-cart";

export interface CartItem {
  skin: Skin;
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

  const add = (skin: Skin) => {
    if (items.find((i) => i.skin.id === skin.id)) return;
    persist([...items, { skin, lineId: `${skin.id}-${Date.now()}` }]);
  };

  const remove = (lineId: string) => persist(items.filter((i) => i.lineId !== lineId));
  const clear = () => persist([]);

  const total = items.reduce((s, i) => s + i.skin.price, 0);
  return { items, add, remove, clear, total };
}
