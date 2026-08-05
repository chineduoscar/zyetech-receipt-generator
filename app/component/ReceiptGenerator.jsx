"use client";

import React, { useState } from "react";
import { customAlphabet } from "nanoid";
import Image from "next/image";
import { generatePDFReceipt } from "../../app/utils/downloadReciept";
import ReceiptSuccessView from "../../app/component/ReceiptSuccessView";

// --- COURSES DATA ARRAY ---
const COURSES = [
  "Data Analytics",
  "Digital Marketing",
  "Cybersecurity",
  "UI/UX Design",
  "kiddies Bootcamp",
  "Product Design",
  "Graphics Design",
  "Full Stack Development",
  "Front End Development",
  "Back End Development",
  "Generative AI for video animation",
  "Virtual Assistance",
  "Video Editing",
  "Content Creation",
];

const generateReceiptId = customAlphabet(
  "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
  6,
);

function getRandomReceiptNumber() {
  return `PR-${generateReceiptId()}`;
}

function getInitialDate() {
  return new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function ReceiptGenerator() {
  // --- SUBMISSION STATE ---
  const [isSubmitted, setIsSubmitted] = useState(false);

  // --- FORM STATE ---
  const [studentName, setStudentName] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [course, setCourse] = useState(COURSES[0]);
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [totalCost, setTotalCost] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [previousPaid, setPreviousPaid] = useState("");

  const [paymentPlan, setPaymentPlan] = useState("Full payment");
  const [installmentStructure, setInstallmentStructure] = useState("2-part");
  const [currentStage, setCurrentStage] = useState("1st");
  const [settleByDate, setSettleByDate] = useState("");

  // --- ADDITIONAL NOTE STATE ---
  const [note, setNote] = useState("");

  const [includeReceiptNumber, setIncludeReceiptNumber] = useState(true);
  const [receiptNumber, setReceiptNumber] = useState(getRandomReceiptNumber);
  const [receiptDate, setReceiptDate] = useState(getInitialDate);

  const numericTotal = Number(totalCost) || 0;
  const numericCurrentPaid = Number(amountPaid) || 0;
  const numericPrevPaid =
    paymentPlan === "Installmental" && currentStage !== "1st"
      ? Number(previousPaid) || 0
      : 0;

  // Total cumulative amount paid (previous + current session)
  const totalCumulativePaid = numericPrevPaid + numericCurrentPaid;

  // Accurate outstanding balance calculation based on total cumulative payments
  const outstandingBalance = Math.max(0, numericTotal - totalCumulativePaid);

  const isFinalPayment =
    paymentPlan === "Full payment" ||
    (paymentPlan === "Installmental" &&
      ((installmentStructure === "2-part" && currentStage === "2nd") ||
        (installmentStructure === "3-part" && currentStage === "3rd")));

  const getPayload = () => ({
    studentName,
    studentPhone,
    course,
    totalCost: numericTotal,
    amountPaid: numericCurrentPaid,
    previousPaid: numericPrevPaid,
    totalPaid: totalCumulativePaid,
    outstandingBalance,
    paymentMethod,
    paymentPlan,
    installmentStructure,
    currentStage,
    settleByDate,
    note,
    receiptNumber: includeReceiptNumber ? receiptNumber : "",
    receiptDate,
  });

  const handleGenerateReceipt = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleManualDownload = () => {
    generatePDFReceipt(getPayload());
  };

  const handleReset = () => {
    setIsSubmitted(false);
    setReceiptNumber(getRandomReceiptNumber());
    setReceiptDate(getInitialDate());
    setPreviousPaid("");
    setAmountPaid("");
    setNote("");
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans p-3 sm:p-6 lg:p-8 flex flex-col justify-center">
      <div className="max-w-3xl mx-auto w-full">
        {isSubmitted ? (
          <ReceiptSuccessView
            onReset={handleReset}
            onDownload={handleManualDownload}
            studentName={studentName}
            course={course}
            receiptNumber={receiptNumber}
          />
        ) : (
          <>
            {/* Brand Header */}
            <header className="mb-4 sm:mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white px-5 py-4 sm:px-6 rounded-2xl shadow-sm border border-slate-200">
              <div className="flex items-center space-x-3">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={100}
                  height={100}
                  className="w-10 h-10 object-contain"
                />
                <div>
                  <h1
                    className="text-lg sm:text-xl font-bold"
                    style={{ color: "#06066f" }}
                  >
                    Zyetech
                  </h1>
                  <p className="text-[10px] sm:text-xs text-slate-400 uppercase tracking-wider">
                    Innovation Technology
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full self-start sm:self-auto">
                Payment Receipt Generator
              </span>
            </header>

            {/* Form Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
              <h2
                className="text-base sm:text-lg font-semibold mb-5 sm:mb-6 pb-2 border-b border-slate-100"
                style={{ color: "#06066f" }}
              >
                Create Payment Receipt
              </h2>

              <form
                onSubmit={handleGenerateReceipt}
                className="space-y-4 sm:space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Student Name
                    </label>
                    <input
                      type="text"
                      required
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Student Phone Number
                    </label>
                    <input
                      type="text"
                      value={studentPhone}
                      onChange={(e) => setStudentPhone(e.target.value)}
                      placeholder="e.g. 09068097269"
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Course / Program
                  </label>
                  <select
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                  >
                    {COURSES.map((courseName) => (
                      <option key={courseName} value={courseName}>
                        {courseName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Total Cost (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={totalCost}
                      onChange={(e) => setTotalCost(e.target.value)}
                      placeholder="e.g. 120000"
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                      Amount Paid This Session (₦)
                    </label>
                    <input
                      type="number"
                      required
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(e.target.value)}
                      placeholder="e.g. 60000"
                      className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                    />
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-1 sm:gap-0">
                  <span className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase">
                    Calculated Outstanding Balance
                  </span>
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    ₦{outstandingBalance.toLocaleString()}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                  >
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="POS / Card">POS / Card</option>
                    <option value="Cash">Cash</option>
                  </select>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Payment Plan Type
                  </label>
                  <select
                    value={paymentPlan}
                    onChange={(e) => setPaymentPlan(e.target.value)}
                    className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                  >
                    <option value="Full payment">Full Payment</option>
                    <option value="Installmental">Installmental</option>
                  </select>
                </div>

                {paymentPlan === "Installmental" && (
                  <div className="space-y-4 p-3 sm:p-4 bg-slate-50 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Structure
                        </label>
                        <select
                          value={installmentStructure}
                          onChange={(e) =>
                            setInstallmentStructure(e.target.value)
                          }
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                        >
                          <option value="2-part">2-Part Installment</option>
                          <option value="3-part">3-Part Installment</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Installment Stage
                        </label>
                        <select
                          value={currentStage}
                          onChange={(e) => setCurrentStage(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                        >
                          <option value="1st">1st Installment</option>
                          <option value="2nd">2nd Installment</option>
                          {installmentStructure === "3-part" && (
                            <option value="3rd">3rd Installment</option>
                          )}
                        </select>
                      </div>
                    </div>

                    {currentStage !== "1st" && (
                      <div>
                        <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Total Amount Already Paid Previously (₦)
                        </label>
                        <input
                          type="number"
                          value={previousPaid}
                          onChange={(e) => setPreviousPaid(e.target.value)}
                          placeholder="e.g. 40000"
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                        />
                      </div>
                    )}

                    {!isFinalPayment && (
                      <div>
                        <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                          Settle Balance By Date
                        </label>
                        <input
                          type="date"
                          value={settleByDate}
                          onChange={(e) => setSettleByDate(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Additional Note Input */}
                <div>
                  <label className="block text-[11px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Enter any additional details, waivers, or notes here..."
                    className="w-full px-3 py-2 text-sm sm:text-base rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#06066f]"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 text-white font-semibold rounded-lg shadow transition-opacity hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#06066f] cursor-pointer mt-2"
                  style={{ backgroundColor: "#06066f" }}
                >
                  Generate Receipt
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
