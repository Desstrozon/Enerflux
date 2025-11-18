// src/components/StarRating.tsx
import { useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import clsx from "clsx";

type Props = {
  value: number;                // 0..5
  onChange?: (v: number) => void;
  readOnly?: boolean;
  size?: number;                // px
  className?: string;
  step?: 0.5 | 1;               // por defecto 0.5
};

export default function StarRating({
  value,
  onChange,
  readOnly,
  size = 22,
  className,
  step = 0.5,
}: Props) {
  const [hoverVal, setHoverVal] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  const display = hoverVal ?? value;

  const clamp = (n: number) => Math.max(0, Math.min(5, n));
  const roundStep = (n: number) => Math.round(n / step) * step;

  const handleMove = (e: React.MouseEvent) => {
    if (readOnly || !rootRef.current) return;
    const rect = rootRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = x / rect.width; // 0..1
    const approx = roundStep(ratio * 5);
    setHoverVal(clamp(approx));
  };

  const handleLeave = () => setHoverVal(null);
  const handleClick = () => {
    if (readOnly || hoverVal == null || !onChange) return;
    onChange(hoverVal);
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (readOnly || !onChange) return;
    if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      onChange(clamp(roundStep((value ?? 0) + step)));
    } else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      onChange(clamp(roundStep((value ?? 0) - step)));
    }
  };

  // Por cada estrella calculamos el fill 0..1
  const fills = useMemo(() => {
    const arr: number[] = [];
    for (let i = 0; i < 5; i++) {
      const start = i;
      const end = i + 1;
      const f = Math.max(0, Math.min(1, display - start));
      arr.push(Math.max(0, Math.min(1, f)));
    }
    return arr;
  }, [display]);

  return (
    <div
      ref={rootRef}
      className={clsx("inline-flex items-center gap-1 select-none", className)}
      style={{ lineHeight: 0, cursor: readOnly ? "default" : "pointer" }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={handleClick}
      tabIndex={readOnly ? -1 : 0}
      onKeyDown={handleKey}
      aria-label={`Valoración: ${display} de 5`}
      role={readOnly ? "img" : "slider"}
      aria-valuenow={display}
      aria-valuemin={0}
      aria-valuemax={5}
    >
      {fills.map((f, idx) => (
        <div key={idx} className="relative" style={{ width: size, height: size }}>
          {/* fondo */}
          <Star
            width={size}
            height={size}
            className="text-muted-foreground/40"
            strokeWidth={1.5}
          />
          {/* relleno */}
          <div
            className="absolute top-0 left-0 overflow-hidden"
            style={{ width: `${f * 100}%`, height: size }}
          >
            <Star
              width={size}
              height={size}
              className="text-yellow-400 fill-yellow-400"
              strokeWidth={1.5}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
