import PDFDocument from "pdfkit";
import axios from "axios";

export class PDFService {
  async generateReportCard(student, results, analytics) {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: "A4", margin: 40 });
      let buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));
      doc.on("error", reject);

      const isNursery =
        results[0]?.classAtTime?.toLowerCase().includes("nursery") ||
        results[0]?.classAtTime?.toLowerCase().includes("reception");

      doc
        .fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(22)
        .text("JEFFJOL MONTESSORI SCHOOL", { align: "center" });

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("#26 Big Daddy Avenue, Rumuapu Rukpokwu,", { align: "center" })
        .text("Port Harcourt, Rivers State.", { align: "center" })
        .text("Tel: 08038701194", { align: "center" });

      doc.moveDown(0.5);
      doc
        .fontSize(14)
        .font("Helvetica-Bold")
        .text(`(${isNursery ? "NURSERY" : "PRIMARY"} SECTION)`, {
          align: "center",
        });

      try {
        if (student.profilePicture) {
          const response = await axios.get(student.profilePicture, {
            responseType: "arraybuffer",
          });
          doc.image(response.data, 460, 45, { width: 80, height: 80 });
          doc.rect(460, 45, 80, 80).stroke();
        } else {
          doc.rect(460, 45, 80, 80).stroke();
          doc.fontSize(8).text("PHOTO", 485, 80);
        }
      } catch (e) {
        doc.rect(460, 45, 80, 80).stroke();
      }

      doc.moveDown(1);
      const infoTop = doc.y;
      doc.fontSize(10).font("Helvetica-Bold");
      doc.text(`TERM: ${results[0]?.term}`, 40, infoTop);
      doc.text(`SESSION: ${results[0]?.session}`, 160, infoTop);
      doc.text(`CLASS: ${results[0]?.classAtTime}`, 320, infoTop);

      doc.moveDown(0.5);
      doc.text(
        `NAME OF PUPIL: ${student.firstName.toUpperCase()} ${student.lastName.toUpperCase()}`,
        40,
        doc.y,
      );
      doc.moveTo(130, doc.y).lineTo(550, doc.y).stroke();

      doc.moveDown(1.5);
      doc.text("PERFORMANCE IN SUBJECT", { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 40,
        col2 = 220,
        col3 = 290,
        col4 = 360,
        col5 = 430,
        col6 = 500;

      doc.rect(col1, tableTop, 515, 20).fill("#f2f2f2").stroke("#000");
      doc.fillColor("#000").fontSize(9);

      doc.text("A. COGNITIVE SUBJECTS", col1 + 5, tableTop + 5);
      if (isNursery) {
        doc.text("MAX", col3, tableTop + 5);
        doc.text("OBT", col4, tableTop + 5);
      } else {
        doc.text("CA (40%)", col3, tableTop + 5);
        doc.text("EXAM (60%)", col4, tableTop + 5);
        doc.text("TOTAL", col5, tableTop + 5);
      }
      doc.text("REMARKS", col6, tableTop + 5);

      let currentY = tableTop + 20;

      results.forEach((res) => {
        doc.rect(col1, currentY, 515, 20).stroke();
        doc.font("Helvetica").text(res.subject, col1 + 5, currentY + 5);

        if (isNursery) {
          doc.text("100", col3, currentY + 5);
          doc.text(res.totalScore.toString(), col4, currentY + 5);
        } else {
          doc.text(res.caScore.toString(), col3, currentY + 5);
          doc.text(res.examScore.toString(), col4, currentY + 5);
          doc
            .font("Helvetica-Bold")
            .text(res.totalScore.toString(), col5, currentY + 5);
        }

        doc
          .font("Helvetica")
          .fontSize(8)
          .text(res.remarks || "", col6, currentY + 5);
        currentY += 20;
      });

      if (doc.y > 600) doc.addPage();

      doc.moveDown(1);
      const gridTop = doc.y;
      this._drawBehaviorGrid(
        doc,
        gridTop,
        "B. PSYCHOMOTOR",
        results[0]?.behavioralData || {},
      );
      this._drawBehaviorGrid(
        doc,
        gridTop,
        "C. AFFECTIVE",
        results[0]?.behavioralData || {},
        280,
      );

      const footerTop = 720;
      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .text("KEY TO GRADING", 40, footerTop);
      doc
        .font("Helvetica")
        .fontSize(8)
        .text(
          "90 - 100 = Distinction | 80 - 89 = Merit | 70 - 79 = Very Good | 60 - 69 = Good | 50 - 59 = Pass | Below 50 = Still learning",
          40,
          footerTop + 15,
        );

      doc.moveDown(2);
      doc
        .text("__________________________", 40, 780)
        .text("Class Teacher's Signature", 40, 792);

      doc
        .text("__________________________", 380, 780)
        .text("Head Teacher's Signature", 380, 792);

      doc.end();
    });
  }

async generatePaymentReceipt(payment, student, balanceData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A5",
      margin: 0, // We handle margins manually for the sidebar
      layout: "landscape",
    });
    let buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // --- STYLING CONSTANTS ---
    const primaryColor = "#1e1b4b"; // Deep Indigo
    const accentColor = "#4f46e5";  // Electric Indigo
    const successColor = "#10b981"; // Emerald
    const dangerColor = "#ef4444";  // Rose
    const bgSecondary = "#f8fafc"; // Light Slate

    // 1. SIDEBAR DESIGN
    doc.rect(0, 0, 40, 420).fill(primaryColor); // Left Indigo Sidebar
    
    // Vertical Text in Sidebar
    doc.save()
       .rotate(-90, { origin: [20, 210] })
       .fillColor("#ffffff")
       .font("Helvetica-Bold")
       .fontSize(8)
       .text("OFFICIAL BURSARY RECEIPT • JEFFJOL MONTESSORI SCHOOL • VALID DOCUMENT", 20, 210, { align: 'center' })
       .restore();

    // 2. HEADER BLOCK
    const contentX = 70;
    doc.fillColor(primaryColor)
       .font("Helvetica-Bold")
       .fontSize(20)
       .text("JEFFJOL MONTESSORI", contentX, 40);
    
    doc.fillColor(accentColor)
       .fontSize(10)
       .text("NURTURING EXCELLENCE", contentX, 62, { characterSpacing: 2 });

    // Address Info (Top Right)
    doc.fillColor("#64748b")
       .font("Helvetica")
       .fontSize(7)
       .text("26 Big Daddy Avenue, Port Harcourt", 400, 45, { align: "right" })
       .text("Tel: 08038701194 | info@jeffjol.com", 400, 55, { align: "right" });

    // 3. RECEIPT IDENTIFIER
    doc.rect(contentX, 85, 495, 1).fill("#e2e8f0");
    
    doc.fillColor(primaryColor)
       .font("Helvetica-Bold")
       .fontSize(12)
       .text("PAYMENT VOUCHER", contentX, 100);

    doc.fillColor("#94a3b8")
       .fontSize(8)
       .text(`TRANSACTION REF: ${payment.transactionReference}`, 380, 103, { align: "right" });

    // 4. STUDENT INFO BOX
    doc.rect(contentX, 125, 495, 55).fill(bgSecondary);
    
    doc.fillColor("#64748b").font("Helvetica").fontSize(8).text("STUDENT IDENTITY", contentX + 15, 135);
    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(11).text(`${student.user.firstName} ${student.user.lastName}`.toUpperCase(), contentX + 15, 147);
    doc.fillColor("#4f46e5").fontSize(9).text(`CLASS: ${student.currentClass}`, contentX + 15, 162);

    doc.fillColor("#64748b").font("Helvetica").fontSize(8).text("DATE ISSUED", 450, 135, { align: "right" });
    doc.fillColor(primaryColor).font("Helvetica-Bold").fontSize(10).text(`${new Date().toLocaleDateString()}`, 450, 147, { align: "right" });

    // 5. THE MONEY BLOCK (Bank Teller Style)
    const amountTop = 195;
    doc.rect(contentX, amountTop, 495, 50).fill(primaryColor);
    
    // Draw "Money" Icon (Vector)
    doc.circle(contentX + 25, amountTop + 25, 12).fill("#ffffff20");
    doc.fillColor("#ffffff").fontSize(14).text("₦", contentX + 21, amountTop + 18);

    doc.fillColor("#ffffff")
       .font("Helvetica")
       .fontSize(9)
       .text("TOTAL AMOUNT PAID", contentX + 50, amountTop + 12);
    
    doc.font("Helvetica-Bold")
       .fontSize(18)
       .text(`${payment.amount.toLocaleString()}.00`, contentX + 50, amountTop + 25);

    doc.fontSize(8)
       .text("PAYMENT TYPE:", 380, amountTop + 15, { align: "right" });
    doc.fontSize(12)
       .text(payment.feeType.toUpperCase(), 380, amountTop + 25, { align: "right" });

    // 6. FINANCIAL LEDGER SUMMARY
    const summaryTop = 265;
    doc.fillColor("#94a3b8").font("Helvetica-Bold").fontSize(8).text("LEDGER SUMMARY", contentX, summaryTop);
    
    // Draw horizontal lines for the mini-table
    doc.strokeColor("#f1f5f9").lineWidth(1).moveTo(contentX, summaryTop + 12).lineTo( contentX + 200, summaryTop + 12).stroke();

    doc.fillColor("#1e293b").font("Helvetica").fontSize(8).text("Total Billed:", contentX, summaryTop + 22);
    doc.font("Helvetica-Bold").text(`₦${balanceData.totalBilled.toLocaleString()}`, contentX + 120, summaryTop + 22, { align: "right", width: 80 });

    doc.fillColor("#1e293b").text("Total Paid:", contentX, summaryTop + 34);
    doc.font("Helvetica-Bold").fillColor(successColor).text(`₦${balanceData.totalPaid.toLocaleString()}`, contentX + 120, summaryTop + 34, { align: "right", width: 80 });

    doc.fillColor(dangerColor).text("Outstanding:", contentX, summaryTop + 46);
    doc.font("Helvetica-Bold").text(`₦${balanceData.totalBalance.toLocaleString()}`, contentX + 120, summaryTop + 46, { align: "right", width: 80 });

    // 7. STAMP & AUTHENTICITY
    // Draw Stamp Circle
    const stampX = 450;
    const stampY = 300;
    doc.circle(stampX, stampY, 35).lineWidth(2).dash(2, { space: 2 }).stroke(primaryColor);
    
    doc.fillColor(primaryColor)
       .font("Helvetica-Bold")
       .fontSize(10)
       .text("PAID", stampX - 12, stampY - 5);
    
    doc.fontSize(6)
       .font("Helvetica")
       .text("JEFFJOL BURSARY", stampX - 25, stampY + 8);

    // Footer Security Line
    doc.fillColor("#cbd5e1")
       .font("Helvetica-Oblique")
       .fontSize(6)
       .text("This is an electronically generated document. No signature is required. Tampering with this document is a criminal offense.", contentX, 390, { align: "center" });

    doc.end();
  });
}

  _drawBehaviorGrid(doc, y, title, data, xOffset = 40) {
    const width = 240;
    doc.fontSize(9).font("Helvetica-Bold").text(title, xOffset, y);

    const headers = ["EXCELLENT", "GOOD", "FAIR", "POOR"];
    let curY = y + 15;

    doc.rect(xOffset, curY, width, 15).stroke();
    headers.forEach((h, i) => {
      doc.fontSize(6).text(h, xOffset + 100 + i * 35, curY + 5);
    });

    const traits = title.includes("PSYCHOMOTOR")
      ? ["Writing Skill", "Reading Fluency", "Musical Skill", "Creative Skills"]
      : ["Punctuality", "Attendance", "Neatness", "Politeness"];

    traits.forEach((trait) => {
      curY += 15;
      doc.rect(xOffset, curY, width, 15).stroke();
      doc
        .fontSize(8)
        .font("Helvetica")
        .text(trait, xOffset + 5, curY + 5);

      const rating = data[trait.toLowerCase().replace(" ", "")];
      if (rating) {
        const tickIdx = headers.indexOf(rating.toUpperCase());
        if (tickIdx !== -1)
          doc.text("X", xOffset + 115 + tickIdx * 35, curY + 5);
      }
    });
  }
}
