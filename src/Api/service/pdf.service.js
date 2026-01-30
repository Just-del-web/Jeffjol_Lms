import PDFDocument from 'pdfkit';


export class PDFService {
  async generateReportCard(student, results, analytics) {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      let buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // --- 1. HEADER & LOGO ---
      // doc.image('path/to/logo.png', 50, 45, { width: 50 });
      doc.fillColor('#444444')
         .fontSize(20)
         .text('JEFFJOL HIGH SCHOOL', 110, 57)
         .fontSize(10)
         .text('Official Terminal Report Card', 110, 80)
         .moveDown();

      // --- 2. STUDENT INFO ---
      doc.rect(50, 110, 500, 70).stroke(); // Box for info
      doc.fontSize(12).fillColor('#000')
         .text(`Student: ${student.firstName} ${student.lastName}`, 60, 120)
         .text(`Class: ${results[0]?.classAtTime || 'N/A'}`, 60, 140)
         .text(`Term: ${results[0]?.term} Term`, 350, 120)
         .text(`Session: ${results[0]?.session}`, 350, 140);

      // --- 3. THE TABLE HEADER ---
      const tableTop = 200;
      doc.font('Helvetica-Bold');
      this._generateTableRow(doc, tableTop, 'Subject', 'CA (40)', 'Exam (60)', 'Total', 'Grade');
      this._generateHr(doc, tableTop + 20);

      // --- 4. THE TABLE ROWS ---
      let i = 0;
      doc.font('Helvetica');
      results.forEach((res) => {
        const position = tableTop + 30 + (i * 25);
        this._generateTableRow(
          doc, 
          position, 
          res.subject, 
          res.caScore, 
          res.examScore, 
          res.totalScore, 
          res.grade
        );
        this._generateHr(doc, position + 20);
        i++;
      });

      // --- 5. SUMMARY & REMARKS ---
      const summaryTop = tableTop + 60 + (i * 25);
      doc.font('Helvetica-Bold').text(`Average: ${analytics.average}%`, 50, summaryTop);
      doc.text(`Remark: ${analytics.average >= 50 ? 'Promoted' : 'Pass'}`, 50, summaryTop + 20);
      
      doc.font('Helvetica-Oblique')
         .fontSize(10)
         .text("Teacher's Signature: ____________________", 350, summaryTop + 40);

      doc.end();
    });
  }


  // Add to your PDFService class in services/pdf.service.js
async generatePaymentReceipt(payment, student, balanceData) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A5', margin: 30 }); 
    let buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => resolve(Buffer.concat(buffers)));

    // --- Header ---
    doc.fillColor('#1a5f7a').fontSize(16).text('JEFFJOL HIGH SCHOOL', { align: 'center' });
    doc.fillColor('#444444').fontSize(8).text('Bursary Department - Official Receipt', { align: 'center' });
    doc.moveDown();

    // --- Receipt Metadata ---
    doc.fontSize(9).fillColor('#000');
    doc.text(`Receipt No: JHS-REC-${payment._id.toString().slice(-6).toUpperCase()}`, 30, 80);
    doc.text(`Date: ${new Date(payment.verifiedAt).toLocaleDateString()}`, 30, 95);
    
    doc.rect(30, 115, 360, 1).fill('#eeeeee'); 

    // --- Content ---
    doc.moveDown(2);
    doc.fontSize(11).text(`Received from:`, 30, 130);
    doc.font('Helvetica-Bold').text(`${student.firstName} ${student.lastName} (${student.admissionNumber})`, 30, 145);
    
    doc.font('Helvetica').fontSize(11).text(`The sum of:`, 30, 170);
    doc.font('Helvetica-Bold').fontSize(14).text(`N ${payment.amount.toLocaleString()}`, 30, 185);

    doc.font('Helvetica').fontSize(10).text(`Being payment for: ${payment.feeType} (${payment.term} Term)`, 30, 215);
    doc.text(`Payment Method: ${payment.paymentMethod}`, 30, 230);

    // --- Balance Box ---
    doc.rect(30, 260, 360, 40).fill('#f9f9f9').stroke('#dddddd');
    doc.fillColor('#000').font('Helvetica-Bold')
       .text(`Outstanding Balance: N ${balanceData.balance.toLocaleString()}`, 40, 275);

    // --- Footer/Stamp ---
    doc.fontSize(8).fillColor('#888888')
       .text('This is a computer-generated receipt. No signature required.', 30, 320, { align: 'center' });

    doc.end();
  });
}


  // Helper: Draw a table row
  _generateTableRow(doc, y, subject, ca, exam, total, grade) {
    doc.fontSize(10)
       .text(subject, 50, y)
       .text(ca, 200, y)
       .text(exam, 280, y)
       .text(total, 360, y)
       .text(grade, 450, y);
  }

  // Helper: Draw a horizontal line
  _generateHr(doc, y) {
    doc.strokeColor('#aaaaaa')
       .lineWidth(1)
       .moveTo(50, y)
       .lineTo(550, y)
       .stroke();
  }
}