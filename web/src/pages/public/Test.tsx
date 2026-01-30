import { useState } from "react";
import BarcodeScanner from "@/components/BarcodeScanner";

export default function TestPage() {
  const [lastScan, setLastScan] = useState("");
  const [scanning, setScanning] = useState(false);

  const handleScan = (code: string) => {
    setLastScan(code);
    console.log("Scanned barcode:", code);

    // Optional: auto-stop after scan
    // setScanning(false);
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>🛒 Supermarket POS</h1>

      <button
        onClick={() => setScanning((s) => !s)}
        style={{
          padding: "10px 16px",
          fontSize: 16,
          cursor: "pointer",
          marginBottom: 12,
        }}
      >
        {scanning ? "⏹ Stop Scanning" : "▶ Start Scanning"}
      </button>

      <BarcodeScanner onScan={handleScan} enabled={scanning} />

      {lastScan && (
        <div style={{ marginTop: 20 }}>
          <strong>Last scanned:</strong>
          <div style={{ fontSize: 26 }}>{lastScan}</div>
        </div>
      )}
    </div>
  );
}
