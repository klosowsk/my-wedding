"use client";

import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/Button";

interface PixQRCodeProps {
  pixKey: string;
  pixName: string;
  pixCity: string;
  amountCents: number;
  txId: string;
  copyLabel: string;
  copiedLabel: string;
  instructionLabel: string;
}

/**
 * CRC16-CCITT (polynomial 0x1021) for PIX BR Code validation.
 */
function crc16ccitt(str: string): string {
  let crc = 0xffff;
  for (let i = 0; i < str.length; i++) {
    crc ^= str.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Build an EMV TLV field: ID (2 chars) + length (2 chars, zero-padded) + value.
 */
function tlv(id: string, value: string): string {
  const len = value.length.toString().padStart(2, "0");
  return `${id}${len}${value}`;
}

/**
 * Generate a PIX BR Code payload string following the EMV QR Code standard.
 * Reference: https://www.bcb.gov.br/content/estabilidadefinanceira/pix/Regulamento_Pix/II-ManualdePadroesparaIniciacaodoPix.pdf
 */
function generatePixPayload(
  pixKey: string,
  pixName: string,
  pixCity: string,
  amountCents: number,
  txId: string
): string {
  // Sanitize inputs: uppercase, no accents, trim to max lengths
  const safeName = pixName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 25);
  const safeCity = pixCity
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .substring(0, 15);
  const safeTxId = txId.replace(/[^a-zA-Z0-9]/g, "").substring(0, 25) || "***";
  const amountStr = (amountCents / 100).toFixed(2);

  // Merchant Account Information (ID 26)
  const merchantAccountInfo =
    tlv("00", "BR.GOV.BCB.PIX") + tlv("01", pixKey);

  let payload = "";
  // Payload Format Indicator
  payload += tlv("00", "01");
  // Point of Initiation Method (12 = dynamic, one-time use)
  payload += tlv("01", "12");
  // Merchant Account Information
  payload += tlv("26", merchantAccountInfo);
  // Merchant Category Code (0000 = not specified)
  payload += tlv("52", "0000");
  // Transaction Currency (986 = BRL)
  payload += tlv("53", "986");
  // Transaction Amount
  payload += tlv("54", amountStr);
  // Country Code
  payload += tlv("58", "BR");
  // Merchant Name
  payload += tlv("59", safeName);
  // Merchant City
  payload += tlv("60", safeCity);
  // Additional Data Field Template (ID 62) containing txid (ID 05)
  payload += tlv("62", tlv("05", safeTxId));
  // CRC16 placeholder — "6304" + 4 hex digits
  payload += "6304";

  const crc = crc16ccitt(payload);
  return payload + crc;
}

export default function PixQRCode({
  pixKey,
  pixName,
  pixCity,
  amountCents,
  txId,
  copyLabel,
  copiedLabel,
  instructionLabel,
}: PixQRCodeProps) {
  const [copied, setCopied] = useState(false);

  const pixPayload = useMemo(
    () => generatePixPayload(pixKey, pixName, pixCity, amountCents, txId),
    [pixKey, pixName, pixCity, amountCents, txId]
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = pixPayload;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl shadow-[0_2px_12px_rgba(60,53,48,0.08)]">
        <QRCodeSVG
          value={pixPayload}
          size={200}
          level="M"
          bgColor="#FFFFFF"
          fgColor="#3C3530"
        />
      </div>

      {/* Instruction */}
      <p className="text-muted text-sm text-center">{instructionLabel}</p>

      {/* PIX code (truncated display) */}
      <div className="w-full bg-surface border border-secondary rounded-lg p-3">
        <p className="text-body text-xs font-mono break-all leading-relaxed line-clamp-3">
          {pixPayload}
        </p>
      </div>

      {/* Copy button */}
      <Button
        variant="secondary"
        size="sm"
        onClick={handleCopy}
        className="w-full"
      >
        {copied ? copiedLabel : copyLabel}
      </Button>
    </div>
  );
}
