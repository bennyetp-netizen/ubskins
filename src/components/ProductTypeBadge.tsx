import { Badge } from "@/components/ui/badge";
import type { ProductType } from "@/data/skins";

interface Props {
  type: ProductType;
  className?: string;
  withSubLabel?: boolean;
}

const ProductTypeBadge = ({ type, className = "", withSubLabel = false }: Props) => {
  if (type === "ready") {
    return (
      <div className={`inline-flex flex-col items-start gap-0.5 ${className}`}>
        <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20">
          🟢 БЭЛЭН
        </Badge>
        {withSubLabel && (
          <span className="text-[10px] font-medium text-emerald-400/80">Өнөөдөр хүргэнэ</span>
        )}
      </div>
    );
  }
  return (
    <div className={`inline-flex flex-col items-start gap-0.5 ${className}`}>
      <Badge className="border-orange-500/40 bg-orange-500/15 text-orange-400 hover:bg-orange-500/20">
        🟡 ЗАХИАЛГА
      </Badge>
      {withSubLabel && (
        <span className="text-[10px] font-medium text-orange-400/80">2-5 хоногт хүргэнэ</span>
      )}
    </div>
  );
};

export default ProductTypeBadge;
