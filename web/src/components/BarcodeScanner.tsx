import { useEffect, useRef } from "react";

type Props = {
  onScan: (code: string) => void;
  enabled: boolean;
};

export default function BarcodeScanner({ onScan, enabled }: Props) {
  const buffer = useRef("");
  const lastTime = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const now = Date.now();

      // Reset buffer if typing is slow (human typing)
      if (now - lastTime.current > 120) {
        buffer.current = "";
      }

      lastTime.current = now;

      if (e.key === "Enter") {
        if (buffer.current.length >= 4) {
          onScan(buffer.current);
        }
        buffer.current = "";
        return;
      }

      if (e.key.length === 1) {
        buffer.current += e.key;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onScan, enabled]);

  return (
    <div style={{ fontSize: 14, opacity: enabled ? 0.8 : 0.4 }}>
      {enabled ? "📡 Scanning enabled" : "⏸ Scanning paused"}
    </div>
  );
}
