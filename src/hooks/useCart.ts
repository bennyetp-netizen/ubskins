import { useEffect, useState } from "react";
import type { Skin } from "@/data/skins";

const KEY = "skinhub-cart";

export interface CartItem {
  skin: Skin;
}

const read = (): CartItem[] => {
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
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
    persist([...items, { skin }]);
  };

  const remove = (id: string) => persist(items.filter((i) => i.skin.id !== id));
  const clear = () => persist([]);

  const total = items.reduce((s, i) => s + i.skin.price, 0);
  return { items, add, remove, clear, total };
}
