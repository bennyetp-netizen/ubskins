import { useRef, useState, type ReactNode } from "react";
import { Trash2 } from "lucide-react";

interface Props {
  children: ReactNode;
  onDelete: () => void;
}

const THRESHOLD = 100; // px to trigger delete

export default function SwipeableCartItem({ children, onDelete }: Props) {
  const [dx, setDx] = useState(0);
  const [removing, setRemoving] = useState(false);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  const onStart = (x: number) => {
    startX.current = x;
    dragging.current = true;
  };
  const onMove = (x: number) => {
    if (startX.current === null || !dragging.current) return;
    const delta = x - startX.current;
    // Allow swipe in either direction, but cap
    setDx(Math.max(-300, Math.min(300, delta)));
  };
  const onEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    if (Math.abs(dx) > THRESHOLD) {
      setRemoving(true);
      setDx(dx > 0 ? 600 : -600);
      setTimeout(onDelete, 220);
    } else {
      setDx(0);
    }
    startX.current = null;
  };

  const opacity = removing ? 0 : Math.max(0.3, 1 - Math.abs(dx) / 250);

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <div
        className={`pointer-events-none absolute inset-0 flex items-center rounded-2xl ${
          dx > 0 ? "justify-start pl-6" : "justify-end pr-6"
        } ${Math.abs(dx) > THRESHOLD ? "bg-destructive/90" : "bg-destructive/40"}`}
      >
        <div className="flex items-center gap-2 text-destructive-foreground">
          <Trash2 className="h-5 w-5" />
          <span className="font-display text-sm font-semibold">Устгах</span>
        </div>
      </div>

      <div
        className="relative touch-pan-y select-none"
        style={{
          transform: `translateX(${dx}px)`,
          opacity,
          transition: dragging.current ? "none" : "transform 220ms ease, opacity 220ms ease",
        }}
        onTouchStart={(e) => onStart(e.touches[0].clientX)}
        onTouchMove={(e) => onMove(e.touches[0].clientX)}
        onTouchEnd={onEnd}
        onTouchCancel={onEnd}
        onPointerDown={(e) => {
          if (e.pointerType === "mouse") onStart(e.clientX);
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse" && dragging.current) onMove(e.clientX);
        }}
        onPointerUp={(e) => {
          if (e.pointerType === "mouse") onEnd();
        }}
        onPointerCancel={(e) => {
          if (e.pointerType === "mouse") onEnd();
        }}
      >
        {children}
      </div>
    </div>
  );
}
