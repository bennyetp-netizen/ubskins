import { useRef, useState, type ReactNode, type PointerEvent } from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  children: ReactNode;
  onDelete: () => void;
}

const THRESHOLD = 80;

export default function SwipeableCartItem({ children, onDelete }: Props) {
  const { t } = useTranslation();
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [removing, setRemoving] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const axisLocked = useRef<"h" | "v" | null>(null);
  const activeId = useRef<number | null>(null);

  const handlePointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (removing) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    axisLocked.current = null;
    activeId.current = e.pointerId;
    setDragging(true);
  };

  const handlePointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!dragging || activeId.current !== e.pointerId) return;
    const deltaX = e.clientX - startX.current;
    const deltaY = e.clientY - startY.current;

    if (axisLocked.current === null) {
      if (Math.abs(deltaX) < 6 && Math.abs(deltaY) < 6) return;
      axisLocked.current = Math.abs(deltaX) > Math.abs(deltaY) ? "h" : "v";
      if (axisLocked.current === "h") {
        try {
          (e.currentTarget as Element).setPointerCapture(e.pointerId);
        } catch {}
      }
    }

    if (axisLocked.current === "h") {
      e.preventDefault();
      setDx(Math.max(-300, Math.min(300, deltaX)));
    }
  };

  const finish = (e: PointerEvent<HTMLDivElement>) => {
    if (activeId.current !== e.pointerId) return;
    activeId.current = null;
    const wasHorizontal = axisLocked.current === "h";
    setDragging(false);
    if (wasHorizontal && Math.abs(dx) > THRESHOLD) {
      setRemoving(true);
      setDx(dx > 0 ? 600 : -600);
      setTimeout(onDelete, 220);
    } else {
      setDx(0);
    }
  };

  const opacity = removing ? 0 : Math.max(0.4, 1 - Math.abs(dx) / 300);
  const showDeleteBg = Math.abs(dx) > 8;

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {showDeleteBg && (
        <div
          className={`pointer-events-none absolute inset-0 flex items-center rounded-2xl transition-colors ${
            dx > 0 ? "justify-start pl-6" : "justify-end pr-6"
          } ${Math.abs(dx) > THRESHOLD ? "bg-destructive" : "bg-destructive/40"}`}
        >
          <div className="flex items-center gap-2 text-destructive-foreground">
            <Trash2 className="h-5 w-5" />
            <span className="font-display text-sm font-semibold">{t("swipe.delete")}</span>
          </div>
        </div>
      )}

      <div
        className="relative select-none"
        style={{
          transform: `translateX(${dx}px)`,
          opacity,
          transition: dragging ? "none" : "transform 220ms ease, opacity 220ms ease",
          touchAction: "pan-y",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finish}
        onPointerCancel={finish}
      >
        {children}
      </div>
    </div>
  );
}
