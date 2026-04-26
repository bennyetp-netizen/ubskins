import { Link } from "react-router-dom";
import type { Skin } from "@/data/skins";
import { formatMNT, storepayMonthly, wearColor, wearLabel } from "@/data/skins";
import { Badge } from "@/components/ui/badge";

interface Props {
  skin: Skin;
}

const SkinCard = ({ skin }: Props) => {
  return (
    <Link
      to={`/skin/${skin.id}`}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-card card-hover"
    >
      {/* top accent bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-secondary/40 to-background p-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(186_100%_50%/0.12),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100" />
        <img
          src={skin.image}
          alt={`${skin.weaponName} | ${skin.name}`}
          loading="lazy"
          className="relative z-10 max-h-full w-auto object-contain transition-transform duration-500 group-hover:scale-110"
        />
        {skin.statTrak && (
          <Badge className="absolute left-3 top-3 border-warning/30 bg-warning/10 text-warning hover:bg-warning/20">
            StatTrak™
          </Badge>
        )}
        <Badge
          variant="outline"
          className={`absolute right-3 top-3 border-current/30 bg-background/60 backdrop-blur ${wearColor[skin.wear]}`}
        >
          {skin.wear}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">
            {skin.weaponName}
          </p>
          <h3 className="font-display text-base font-semibold leading-tight">
            {skin.name}
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className={wearColor[skin.wear]}>{wearLabel[skin.wear]}</span>
          <span>Float {skin.float.toFixed(3)}</span>
        </div>

        <div className="mt-2 flex items-end justify-between border-t border-border/60 pt-3">
          <div>
            <p className="font-display text-lg font-bold text-foreground">
              {formatMNT(skin.price)}
            </p>
            <p className="text-[11px] text-muted-foreground">
              эсвэл <span className="text-accent">{formatMNT(storepayMonthly(skin.price))}</span> × 4
            </p>
          </div>
          <span className="text-[11px] text-muted-foreground">
            Үлд: {skin.stock}
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SkinCard;
