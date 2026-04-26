import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/useCart";
import { formatMNT, storepayMonthly, wearColor } from "@/data/skins";
import { toast } from "sonner";

const Cart = () => {
  const { items, remove, clear, total } = useCart();

  const checkout = (m: string) => {
    toast.success(`${m} төлбөр амжилттай үүслээ. Steam trade offer удахгүй явна.`);
    clear();
  };

  if (items.length === 0) {
    return (
      <div className="container py-20 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
          <ShoppingBag className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="font-display text-2xl font-bold">Сагс хоосон байна</h1>
        <p className="mt-1 text-muted-foreground">Дэлгүүрээс дуртай скинээ сонгоно уу.</p>
        <Link to="/shop"><Button variant="hero" className="mt-6">Дэлгүүр рүү</Button></Link>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="mb-8 font-display text-3xl font-bold md:text-4xl">Сагс / Төлбөр</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {items.map(({ skin }) => (
            <div key={skin.id} className="flex gap-4 rounded-2xl border border-border bg-gradient-card p-4">
              <div className="flex h-24 w-32 shrink-0 items-center justify-center rounded-xl bg-secondary/50">
                <img src={skin.image} alt={skin.name} className="max-h-full object-contain" />
              </div>
              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">{skin.weaponName}</p>
                  <p className="font-display font-semibold">{skin.name}</p>
                  <p className={`text-xs ${wearColor[skin.wear]}`}>{skin.wear} · Float {skin.float.toFixed(3)}</p>
                </div>
                <div className="flex items-end justify-between">
                  <p className="font-display text-lg font-bold">{formatMNT(skin.price)}</p>
                  <Button variant="ghost" size="icon" onClick={() => remove(skin.id)} aria-label="Устгах">
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-gradient-card p-5">
            <h3 className="font-display text-lg font-semibold">Захиалгын хураангуй</h3>
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Барааны тоо</span><span>{items.length}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Үйлчилгээний шимтгэл</span><span>0₮</span>
              </div>
              <div className="my-3 border-t border-border" />
              <div className="flex justify-between font-display text-lg font-bold">
                <span>Нийт</span><span className="text-gradient-primary">{formatMNT(total)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                эсвэл Storepay-р <span className="text-accent">{formatMNT(storepayMonthly(total))}</span> × 4 хүүгүй
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <Button variant="storepay" size="lg" className="w-full" onClick={() => checkout("Storepay")}>
                Storepay-р төлөх
              </Button>
              <Button variant="qpay" size="lg" className="w-full" onClick={() => checkout("QPay")}>
                QPay-р төлөх
              </Button>
              <Button variant="outline" size="lg" className="w-full" onClick={() => checkout("Банкны шилжүүлэг")}>
                Банкны шилжүүлэг
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-4 text-sm">
            <div className="mb-2 flex items-center gap-2 font-semibold text-accent">
              <ShieldCheck className="h-4 w-4" /> Хамгаалалттай төлбөр
            </div>
            <p className="text-muted-foreground">
              Төлбөр баталгаажсаны дараа Steam trade offer-р скин автоматаар хүргэгдэнэ. Trade URL-аа account хэсгээс шинэчлээрэй.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
