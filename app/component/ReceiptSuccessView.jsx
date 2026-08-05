"use client";

import React from "react";
import Image from "next/image";

export default function ReceiptSuccessView({
  onReset,
  onDownload,
  studentName,
  course,
  receiptNumber,
}) {
  const handleWhatsAppShare = () => {
    // 1. Download the PDF locally first
    onDownload();

    // 2. Format and open the WhatsApp message link
    const message = encodeURIComponent(
      `Hello ${studentName}, here is your payment receipt for your enrollment in ${course} at Zyetech Innovation Technology.`,
    );
    window.open(`https://api.whatsapp.com/send?text=${message}`, "_blank");
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
          onClick={onDownload}
          className="w-full py-3 px-4 text-white font-semibold rounded-lg shadow transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06066f] cursor-pointer"
          style={{ backgroundColor: "#06066f" }}
        >
          Download Receipt
        </button>

        <div className="grid gap-3">
          <button
            onClick={handleWhatsAppShare}
            className="w-full py-2.5 px-3 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition-colors focus:outline-none cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Download & Share via WhatsApp</span>
          </button>
        </div>

        <button
          onClick={onReset}
          className="w-full py-2 text-xs text-slate-400 hover:text-slate-600 transition-colors cursor-pointer pt-2"
        >
          ← Create Another Receipt
        </button>
      </div>
    </div>
  );
}
