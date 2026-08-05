import jsPDF from "jspdf";

const loadImageAsBase64 = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject(new Error("Canvas context unavailable"));
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
};

export const generatePDFReceipt = async (data) => {
  const {
    studentName,
    studentPhone,
    course,
    totalCost,
    amountPaid,
    previousPaid,
    totalPaid,
    outstandingBalance,
    paymentMethod,
    paymentPlan,
    currentStage,
    settleByDate,
    note,
    receiptNumber,
    receiptDate,
  } = data;

  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;

  const navy = [6, 6, 111]; // #06066f
  const dark = [30, 33, 40];
  const gray = [100, 110, 120];

  let y = 40;

  // --- HEADER SECTION ---
  try {
    const logoBase64 = await loadImageAsBase64("/logo.png");
    doc.addImage(logoBase64, "PNG", pageWidth - marginX - 50, y, 50, 50);
  } catch (err) {
    console.error("Logo failed to load", err);
  }

  doc.setTextColor(...navy);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("ZYETECH INNOVATION TECHNOLOGY", marginX, y + 12);

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "36 Trans Amadi Industrial Layout Road, Rumuobiakani",
    marginX,
    y + 28,
  );
  doc.text("Port -Harcourt, Rivers State.", marginX, y + 42);

  doc.setFontSize(8.5);
  doc.text(
    "Call: (+234) 9113263807     |     Email: zyetechofficial@gmail.com",
    marginX,
    y + 58,
  );

  y += 85;

  // --- TITLE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  doc.setTextColor(...dark);
  doc.text("PAYMENT RECEIPT", marginX, y);

  y += 20;

  // --- META INFO ---
  doc.setFontSize(9);
  doc.setTextColor(...gray);

  if (receiptNumber && receiptNumber.trim() !== "") {
    doc.text("Receipt No:", marginX, y + 12);
  }
  doc.text("Date:", marginX + 160, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);

  if (receiptNumber && receiptNumber.trim() !== "") {
    doc.text(receiptNumber, marginX, y + 26);
  }
  doc.text(receiptDate, marginX + 160, y + 26);

  y += 40;

  // Divider line
  doc.setDrawColor(30, 33, 40);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 25;

  // --- BILLED TO & SUMMARY ---
  const leftColX = marginX;
  const rightColX = pageWidth / 2 + 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text("Received From:", leftColX, y);
  doc.text("Payment Summary:", rightColX, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Left column details
  doc.text(`Name:   ${studentName}`, leftColX, y);
  doc.text(`Contact: ${studentPhone}`, leftColX, y + 16);

  // Right column details
  const numericTotal = Number(totalCost) || 0;
  const numericCurrentPaid = Number(amountPaid) || 0;
  const numericPrevPaid = Number(previousPaid) || 0;
  const cumulativePaid =
    Number(totalPaid) || numericCurrentPaid + numericPrevPaid;
  const outstanding =
    Number(outstandingBalance) || Math.max(0, numericTotal - cumulativePaid);

  let rightOffset = 0;
  doc.text(`Total Cost: NGN ${numericTotal.toLocaleString()}`, rightColX, y);
  rightOffset += 16;

  if (paymentPlan === "Installmental" && currentStage !== "1st") {
    doc.text(
      `Previous Paid: NGN ${numericPrevPaid.toLocaleString()}`,
      rightColX,
      y + rightOffset,
    );
    rightOffset += 16;
  }

  doc.text(
    `Amount Paid (Current): NGN ${numericCurrentPaid.toLocaleString()}`,
    rightColX,
    y + rightOffset,
  );
  rightOffset += 16;

  doc.text(
    `Total Cumulative Paid: NGN ${cumulativePaid.toLocaleString()}`,
    rightColX,
    y + rightOffset,
  );
  rightOffset += 16;

  doc.text(`Payment Method: ${paymentMethod}`, rightColX, y + rightOffset);
  rightOffset += 16;

  if (paymentPlan === "Installmental") {
    doc.text(
      `Outstanding Balance: NGN ${outstanding.toLocaleString()}`,
      rightColX,
      y + rightOffset,
    );
    rightOffset += 16;
  }

  y += Math.max(50, rightOffset + 10);

  // --- TABLE HEADER ---
  const tableTop = y;
  doc.setFillColor(...navy);
  doc.rect(marginX, tableTop, contentWidth, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Description", marginX + 10, tableTop + 17);
  doc.text("Amount", pageWidth - marginX - 85, tableTop + 17);

  // --- TABLE ROW ---
  const rowTop = tableTop + 26;
  const rowHeight = 36;
  doc.setDrawColor(180, 184, 192);
  doc.setLineWidth(1);
  doc.rect(marginX, rowTop, contentWidth, rowHeight);

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const rowDescription =
    paymentPlan === "Installmental"
      ? `${course} (${currentStage} Installment)`
      : course;
  doc.text(rowDescription, marginX + 10, rowTop + 22);

  doc.setFont("helvetica", "bold");
  doc.text(
    `NGN ${numericCurrentPaid.toLocaleString()}`,
    pageWidth - marginX - 85,
    rowTop + 22,
  );

  y = rowTop + rowHeight + 25;

  // --- DYNAMIC NOTES SECTION (IF PROVIDED) ---
  if (note && note.trim() !== "") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text("Additional Notes:", marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);

    // Split long text cleanly to fit content width
    const splitNotes = doc.splitTextToSize(note.trim(), contentWidth);
    doc.text(splitNotes, marginX, y + 14, { lineHeightFactor: 1.3 });

    // Push the Y cursor down based on how many lines the note took up
    y += 18 + splitNotes.length * 12;
  }

  // --- TERMS & SIGNATURE SECTION ---
  const termsY = y + 10;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text("Payment Terms:", marginX, termsY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...dark);

  if (paymentPlan === "Installmental" && settleByDate) {
    const formattedDate = new Date(settleByDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    doc.text(
      `This is a part payment. Kindly settle the remaining\nbalance on or before ${formattedDate}.`,
      marginX,
      termsY + 16,
      { lineHeightFactor: 1.3 },
    );
    doc.text(
      "For inquiries, call: (+234) 9113263807 or\nemail: zyetechofficial@gmail.com",
      marginX,
      termsY + 54,
      { lineHeightFactor: 1.3 },
    );
  } else {
    doc.text(
      "For inquiries, call: (+234) 9113263807 or\nemail: zyetechofficial@gmail.com",
      marginX,
      termsY + 16,
      { lineHeightFactor: 1.3 },
    );
  }

  // Right Side: Authorized By & Signature
  const sigX = pageWidth / 2 + 20;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("Authorized By:", sigX, termsY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Emmanuel Majekodunmi", sigX, termsY + 16);

  try {
    const sigBase64 = await loadImageAsBase64("/sign.jpg");
    doc.addImage(sigBase64, "JPEG", sigX, termsY + 22, 130, 45);
  } catch (err) {
    console.error("Signature failed to load", err);
  }

  doc.setDrawColor(30, 33, 40);
  doc.setLineWidth(1);
  doc.line(sigX, termsY + 75, pageWidth - marginX, termsY + 75);

  doc.setFontSize(8.5);
  doc.text("Signature", sigX, termsY + 87);

  // --- THANK YOU FOOTER ---
  const footerY = Math.max(termsY + 110, termsY + 95);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text("Thank You For", marginX, footerY);
  doc.text("Your Payment!", marginX, footerY + 15);

  const saveFileName =
    receiptNumber && receiptNumber.trim() !== ""
      ? `zyetech-receipt-${receiptNumber}.pdf`
      : `zyetech-receipt-general.pdf`;

  doc.save(saveFileName);
};
