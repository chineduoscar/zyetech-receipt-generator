"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

const Spinner = () => (
  <svg
    className="animate-spin w-4 h-4"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

export default function ReceiptSuccessView({
  onReset,
  onDownload,
  studentName,
  course,
  receiptNumber,
}) {
  // Which action is running: null | "download" | "whatsapp"
  const [busy, setBusy] = useState(null);
  // Ref guard blocks a second click instantly, before React re-renders
  const lockRef = useRef(false);

  const isBusy = busy !== null;

  // Runs an async task once, keeps the "Downloading..." state visible briefly
  const runLocked = async (type, task) => {
    if (lockRef.current) return;
    lockRef.current = true;
    setBusy(type);
    try {
      await Promise.all([
        Promise.resolve(task()),
        new Promise((r) => setTimeout(r, 800)), // minimum visible time
      ]);
    } catch (err) {
      console.error("Download failed", err);
    } finally {
      lockRef.current = false;
      setBusy(null);
    }
  };

  const handleDownload = () => runLocked("download", onDownload);

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Hello ${studentName}, here is your payment receipt for your enrollment in ${course} at Zyetech Innovation Technology.`,
    );
    const url = `https://api.whatsapp.com/send?text=${message}`;

    // Open the tab now (inside the click) so popup blockers allow it,
    // then point it at WhatsApp once the PDF has downloaded.
    const waWindow = window.open("", "_blank");

    runLocked("whatsapp", onDownload).then(() => {
      if (waWindow) waWindow.location.href = url;
      else window.open(url, "_blank");
    });
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 text-center space-y-6 mx-auto">
      {/* Brand Header */}
      <div className="flex flex-col items-center space-y-2">
        <Image
          src="/logo.png"
          alt="logo"
          width={100}
          height={100}
          className="w-12 h-12"
        />
        <h1 className="text-xl font-bold" style={{ color: "#06066f" }}>
          Zyetech
        </h1>
        <p className="text-xs text-slate-400 uppercase tracking-wider">
          Innovation Technology
        </p>
      </div>

      {/* Success Message */}
      <div className="space-y-2 py-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-lg font-bold text-slate-900">
          Your receipt has been created!
        </h2>
        <p className="text-sm text-slate-500">
          Clicking WhatsApp will automatically download your PDF and open the
          chat so you can attach it.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-2">
        <button
          onClick={handleDownload}
          disabled={isBusy}
          aria-busy={busy === "download"}
          className="w-full py-3 px-4 text-white font-semibold rounded-lg shadow transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06066f] cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ backgroundColor: "#06066f" }}
        >
          {busy === "download" ? (
            <>
              <Spinner />
              <span>Downloading...</span>
            </>
          ) : (
            <span>Download Receipt</span>
          )}
        </button>

        <div className="grid gap-3">
          <button
            onClick={handleWhatsAppShare}
            disabled={isBusy}
            aria-busy={busy === "whatsapp"}
            className="w-full py-2.5 px-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {busy === "whatsapp" ? (
              <>
                <Spinner />
                <span>Downloading...</span>
              </>
            ) : (
              <span>Download & Share via WhatsApp</span>
            )}
          </button>
        </div>

        <button
          onClick={onReset}
          disabled={isBusy}
          className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer pt-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          ← Create Another Receipt
        </button>
      </div>
    </div>
  );
}
