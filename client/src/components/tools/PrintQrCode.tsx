import { useEffect, useState } from "react";
import QRCode from "qrcode";

interface PrintQrCodeProps {
  url: string;
}

export default function PrintQrCode({ url }: PrintQrCodeProps) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!url) return;

    const generate = async () => {
      const qrCanvas = document.createElement("canvas");
      const qrSize = 200;

      await QRCode.toCanvas(qrCanvas, url, {
        width: qrSize,
        margin: 2,
        errorCorrectionLevel: "H",
        color: {
          dark: "#000000",
          light: "#ffffff",
        },
      });

      const ctx = qrCanvas.getContext("2d");
      if (!ctx) return;

      const badge = new Image();
      badge.crossOrigin = "anonymous";
      badge.src = "/pe-badge.png";

      badge.onload = () => {
        const badgeSize = Math.floor(qrSize * 0.25);
        const x = (qrSize - badgeSize) / 2;
        const y = (qrSize - badgeSize) / 2;

        const padding = 4;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(x - padding, y - padding, badgeSize + padding * 2, badgeSize + padding * 2);

        ctx.drawImage(badge, x, y, badgeSize, badgeSize);

        setDataUrl(qrCanvas.toDataURL("image/png"));
      };

      badge.onerror = () => {
        setDataUrl(qrCanvas.toDataURL("image/png"));
      };
    };

    generate();
  }, [url]);

  if (!dataUrl) return null;

  return (
    <div className="print-only print-qr-section">
      <div className="print-qr-container">
        <img
          src={dataUrl}
          alt="QR code to load your custom results on any device"
          className="print-qr-image"
          data-testid="img-qr-code"
        />
        <p className="print-qr-text" data-testid="text-qr-instructions">
          Scan to load your custom results on any device
        </p>
      </div>
    </div>
  );
}
