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
  const pageHeight = doc.internal.pageSize.getHeight();
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

  const hasReceiptNo = receiptNumber && receiptNumber.trim() !== "";

  if (hasReceiptNo) {
    doc.text("Receipt No:", marginX, y + 12);
  }
  doc.text("Date:", marginX + 160, y + 12);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(...dark);

  if (hasReceiptNo) {
    doc.text(receiptNumber, marginX, y + 26);
  }
  doc.text(receiptDate || "", marginX + 160, y + 26);

  y += 40;

  // Divider line
  doc.setDrawColor(30, 33, 40);
  doc.setLineWidth(1.5);
  doc.line(marginX, y, pageWidth - marginX, y);

  y += 25;

  // --- RECEIVED FROM & PAYMENT SUMMARY ---
  const leftColX = marginX;
  const rightColX = pageWidth / 2 + 20;
  const leftColWidth = pageWidth / 2 - marginX - 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text("Received From:", leftColX, y);
  doc.text("Payment Summary:", rightColX, y);

  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  // Left column details (wrapped so long values never reach the right column)
  const nameLines = doc.splitTextToSize(`Name:   ${studentName}`, leftColWidth);
  doc.text(nameLines, leftColX, y);
  const contactLines = doc.splitTextToSize(
    `Contact: ${studentPhone}`,
    leftColWidth,
  );
  const contactY = y + nameLines.length * 13 + 3;
  doc.text(contactLines, leftColX, contactY);
  const leftColEnd = contactY + contactLines.length * 13;

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

  // Move below whichever column is taller
  y = Math.max(y + rightOffset, leftColEnd) + 20;

  // --- TABLE HEADER ---
  const tableTop = y;
  doc.setFillColor(...navy);
  doc.rect(marginX, tableTop, contentWidth, 26, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Description", marginX + 10, tableTop + 17);
  doc.text("Amount", pageWidth - marginX - 85, tableTop + 17);

  // --- TABLE ROW (wraps long course names) ---
  const rowTop = tableTop + 26;
  const rowDescription =
    paymentPlan === "Installmental"
      ? `${course} (${currentStage} Installment)`
      : course;

  doc.setTextColor(...dark);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  const descLines = doc.splitTextToSize(rowDescription, contentWidth - 130);
  const rowHeight = Math.max(36, descLines.length * 12 + 20);

  doc.setDrawColor(180, 184, 192);
  doc.setLineWidth(1);
  doc.rect(marginX, rowTop, contentWidth, rowHeight);

  doc.text(descLines, marginX + 10, rowTop + 22);
  doc.setFont("helvetica", "bold");
  doc.text(
    `NGN ${numericCurrentPaid.toLocaleString()}`,
    pageWidth - marginX - 85,
    rowTop + 22,
  );

  y = rowTop + rowHeight + 25;

  // --- NOTES (if provided) ---
  if (note && note.trim() !== "") {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...navy);
    doc.text("Additional Notes:", marginX, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...dark);
    const splitNotes = doc.splitTextToSize(note.trim(), contentWidth);
    doc.text(splitNotes, marginX, y + 14, { lineHeightFactor: 1.3 });
    y += 18 + splitNotes.length * 9 * 1.3 + 10;
  }

  // --- PAGE BREAK CHECK (bottom section needs ~260pt) ---
  if (y + 260 > pageHeight - 40) {
    doc.addPage();
    y = 40;
  }

  // --- LEFT COLUMN: TERMS + POLICY (flowing cursor) ---
  const leftWidth = pageWidth / 2 - marginX - 20;
  const sigX = pageWidth / 2 + 20;
  const sectionTop = y + 10;
  let leftY = sectionTop;

  const drawParagraph = (text, size, gapAfter = 8) => {
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, leftWidth);
    doc.text(lines, marginX, leftY, { lineHeightFactor: 1.3 });
    leftY += lines.length * size * 1.3 + gapAfter;
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text("Payment Terms:", marginX, leftY);
  leftY += 16;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);

  if (paymentPlan === "Installmental" && settleByDate) {
    const formattedDate = new Date(settleByDate).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    drawParagraph(
      `This is a part payment. Kindly settle the remaining balance on or before ${formattedDate}.`,
      9,
    );
  }
  drawParagraph(
    "For inquiries, call: (+234) 9113263807 or email: zyetechofficial@gmail.com",
    9,
    14,
  );

  // Policy notice
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(...navy);
  doc.text("NOTE:", marginX, leftY);
  leftY += 12;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(...dark);
  drawParagraph(
    "1. No Refund Policy: All payments made are non-refundable.",
    8,
    4,
  );
  drawParagraph(
    "2. No Course Change: Once the first class of a course has commenced, students are not permitted to change to another course.",
    8,
    4,
  );

  // --- RIGHT COLUMN: SIGNATURE ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...dark);
  doc.text("Authorized By:", sigX, sectionTop);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("Emmanuel Majekodunmi", sigX, sectionTop + 16);

  try {
    const sigBase64 = await loadImageAsBase64("/sign.png");
    doc.addImage(sigBase64, "PNG", sigX, sectionTop + 22, 130, 45);
  } catch (err) {
    console.error("Signature failed to load", err);
  }

  doc.setDrawColor(30, 33, 40);
  doc.setLineWidth(1);
  doc.line(sigX, sectionTop + 75, pageWidth - marginX, sectionTop + 75);
  doc.setFontSize(8.5);
  doc.text("Signature", sigX, sectionTop + 87);

  const rightEnd = sectionTop + 87;

  // --- THANK YOU FOOTER (below whichever column is longer) ---
  const footerY = Math.max(leftY, rightEnd) + 30;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(...dark);
  doc.text("Thank You For", marginX, footerY);
  doc.text("Your Payment!", marginX, footerY + 15);

  const saveFileName = hasReceiptNo
    ? `zyetech-receipt-${receiptNumber}.pdf`
    : `zyetech-receipt-general.pdf`;

  doc.save(saveFileName);
};
