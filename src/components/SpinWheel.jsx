import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

const N = 10;
const SEG_DEG = 360 / N;
const SEGMENTS = [
  { label: "AWP Asiimov", color: "#BA7517", key: "asiimov", desc: "Та AWP Asiimov хожлоо!" },
  { label: "Хоосон",      color: "#3a3a3a", key: "empty",   desc: "Дараагийн удаа азаа сорь" },
  { label: "50 оноо",     color: "#3B6D11", key: "points",  desc: "+50 оноо нэмэгдлээ" },
  { label: "Хоосон",      color: "#2c2c2c", key: "empty",   desc: "Дараагийн удаа азаа сорь" },
  { label: "10% хямдрал", color: "#1F4E79", key: "discount",desc: "10% хямдралын купон" },
  { label: "Хоосон",      color: "#3a3a3a", key: "empty",   desc: "Дараагийн удаа азаа сорь" },
  { label: "100 оноо",    color: "#3B6D11", key: "points",  desc: "+100 оноо нэмэгдлээ" },
  { label: "Хоосон",      color: "#2c2c2c", key: "empty",   desc: "Дараагийн удаа азаа сорь" },
  { label: "5% хямдрал",  color: "#1F4E79", key: "discount",desc: "5% хямдралын купон" },
  { label: "Хоосон",      color: "#3a3a3a", key: "empty",   desc: "Дараагийн удаа азаа сорь" },
];

function polar(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function segPath(cx, cy, r, startDeg, endDeg) {
  const s = polar(cx, cy, r, startDeg);
  const e = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${s.x} ${s.y} A ${r} ${r} 0 ${large} 1 ${e.x} ${e.y} Z`;
}

export default function SpinWheel({ orderId }) {
  const [status, setStatus] = useState("idle"); // idle | spinning | done
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  const [spinning, setSpinning] = useState(false);
  const wheelRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!orderId) return;
      const { data } = await supabase
        .from("orders")
        .select("spin_result")
        .eq("id", orderId)
        .maybeSingle();
      if (mounted && data?.spin_result) {
        const idx = SEGMENTS.findIndex((s) => s.key === data.spin_result);
        if (idx >= 0) {
          setResult(SEGMENTS[idx]);
          setStatus("done");
        }
      }
    })();
    return () => { mounted = false; };
  }, [orderId]);

  const spin = useCallback(async () => {
    if (spinning || status === "done") return;
    setSpinning(true);
    setStatus("spinning");

    const idx = Math.floor(Math.random() * N);
    const seg = SEGMENTS[idx];
    const target = 360 * 6 + (360 - (idx * SEG_DEG + SEG_DEG / 2));
    setRotation(target);

    setTimeout(async () => {
      setResult(seg);
      setStatus("done");
      setSpinning(false);
      if (orderId) {
        await supabase.from("orders").update({ spin_result: seg.key }).eq("id", orderId);
      }
    }, 4200);
  }, [spinning, status, orderId]);

  const size = 280;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 6;

  return (
    <div style={{ textAlign: "center", padding: 16 }}>
      <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>🎁 Азын дугуй</h3>

      {status !== "done" && (
        <>
          <div style={{ position: "relative", width: size, height: size, margin: "0 auto" }}>
            <div
              style={{
                position: "absolute",
                top: -2,
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderTop: "20px solid #e94560",
                zIndex: 2,
              }}
            />
            <svg
              ref={wheelRef}
              width={size}
              height={size}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: spinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.21, 1)" : "none",
              }}
            >
              {SEGMENTS.map((s, i) => {
                const start = i * SEG_DEG;
                const end = start + SEG_DEG;
                const mid = start + SEG_DEG / 2;
                const tp = polar(cx, cy, r * 0.65, mid);
                return (
                  <g key={i}>
                    <path d={segPath(cx, cy, r, start, end)} fill={s.color} stroke="#000" strokeWidth="1" />
                    <text
                      x={tp.x}
                      y={tp.y}
                      fill="#fff"
                      fontSize="10"
                      fontWeight="700"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${mid}, ${tp.x}, ${tp.y})`}
                    >
                      {s.label}
                    </text>
                  </g>
                );
              })}
              <circle cx={cx} cy={cy} r={16} fill="#fff" stroke="#000" strokeWidth="2" />
            </svg>
          </div>
          <button
            onClick={spin}
            disabled={spinning}
            style={{
              marginTop: 16,
              padding: "10px 28px",
              fontSize: 14,
              fontWeight: 700,
              background: spinning ? "#888" : "#e94560",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              cursor: spinning ? "not-allowed" : "pointer",
            }}
          >
            {spinning ? "Эргэж байна..." : "Эргүүлэх"}
          </button>
        </>
      )}

      {status === "done" && result && (
        <div style={{ padding: 20, background: "#f9f9f9", borderRadius: 12, maxWidth: 280, margin: "0 auto" }}>
          <p style={{ fontSize: 18, fontWeight: 600, margin: "0 0 6px", color: "#111" }}>{result.label}</p>
          <p style={{ fontSize: 13, color: "#666", margin: 0 }}>{result.desc}</p>
        </div>
      )}
    </div>
  );
}
