import PDFDocument from 'pdfkit';
import axios from 'axios';

export class PDFService {
  async generateReportCard(student, results, analytics) {
    return new Promise(async (resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });
      let buffers = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      const isNursery = results[0]?.classAtTime?.toLowerCase().includes('nursery') || 
                        results[0]?.classAtTime?.toLowerCase().includes('reception');

      doc.fillColor('#000')
         .font('Helvetica-Bold')
         .fontSize(22)
         .text('JEFFJOL MONTESSORI SCHOOL', { align: 'center' });
      
      doc.fontSize(10)
         .font('Helvetica')
         .text('#26 Big Daddy Avenue, Rumuapu Rukpokwu,', { align: 'center' })
         .text('Port Harcourt, Rivers State.', { align: 'center' })
         .text('Tel: 08038701194', { align: 'center' });

      doc.moveDown(0.5);
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text(`(${isNursery ? 'NURSERY' : 'PRIMARY'} SECTION)`, { align: 'center' });

      try {
        if (student.profilePicture) {
          const response = await axios.get(student.profilePicture, { responseType: 'arraybuffer' });
          doc.image(response.data, 460, 45, { width: 80, height: 80 });
          doc.rect(460, 45, 80, 80).stroke(); 
        } else {
          doc.rect(460, 45, 80, 80).stroke();
          doc.fontSize(8).text('PHOTO', 485, 80);
        }
      } catch (e) {
        doc.rect(460, 45, 80, 80).stroke();
      }

      doc.moveDown(1);
      const infoTop = doc.y;
      doc.fontSize(10).font('Helvetica-Bold');
      doc.text(`TERM: ${results[0]?.term}`, 40, infoTop);
      doc.text(`SESSION: ${results[0]?.session}`, 160, infoTop);
      doc.text(`CLASS: ${results[0]?.classAtTime}`, 320, infoTop);
      
      doc.moveDown(0.5);
      doc.text(`NAME OF PUPIL: ${student.firstName.toUpperCase()} ${student.lastName.toUpperCase()}`, 40, doc.y);
      doc.moveTo(130, doc.y).lineTo(550, doc.y).stroke(); 

      doc.moveDown(1.5);
      doc.text('PERFORMANCE IN SUBJECT', { underline: true });
      doc.moveDown(0.5);

      const tableTop = doc.y;
      const col1 = 40, col2 = 220, col3 = 290, col4 = 360, col5 = 430, col6 = 500;

      doc.rect(col1, tableTop, 515, 20).fill('#f2f2f2').stroke('#000');
      doc.fillColor('#000').fontSize(9);
      
      doc.text('A. COGNITIVE SUBJECTS', col1 + 5, tableTop + 5);
      if (isNursery) {
        doc.text('MAX', col3, tableTop + 5);
        doc.text('OBT', col4, tableTop + 5);
      } else {
        doc.text('CA (40%)', col3, tableTop + 5);
        doc.text('EXAM (60%)', col4, tableTop + 5);
        doc.text('TOTAL', col5, tableTop + 5);
      }
      doc.text('REMARKS', col6, tableTop + 5);

      let currentY = tableTop + 20;

      results.forEach((res) => {
        doc.rect(col1, currentY, 515, 20).stroke();
        doc.font('Helvetica').text(res.subject, col1 + 5, currentY + 5);
        
        if (isNursery) {
          doc.text('100', col3, currentY + 5);
          doc.text(res.totalScore.toString(), col4, currentY + 5);
        } else {
          doc.text(res.caScore.toString(), col3, currentY + 5);
          doc.text(res.examScore.toString(), col4, currentY + 5);
          doc.font('Helvetica-Bold').text(res.totalScore.toString(), col5, currentY + 5);
        }
        
        doc.font('Helvetica').fontSize(8).text(res.remarks || '', col6, currentY + 5);
        currentY += 20;
      });

      if (doc.y > 600) doc.addPage(); 

      doc.moveDown(1);
      const gridTop = doc.y;
      this._drawBehaviorGrid(doc, gridTop, 'B. PSYCHOMOTOR', results[0]?.behavioralData || {});
      this._drawBehaviorGrid(doc, gridTop, 'C. AFFECTIVE', results[0]?.behavioralData || {}, 280);

      const footerTop = 720;
      doc.fontSize(9).font('Helvetica-Bold')
         .text('KEY TO GRADING', 40, footerTop);
      doc.font('Helvetica').fontSize(8)
         .text('90 - 100 = Distinction | 80 - 89 = Merit | 70 - 79 = Very Good | 60 - 69 = Good | 50 - 59 = Pass | Below 50 = Still learning', 40, footerTop + 15);

      doc.moveDown(2);
      doc.text('__________________________', 40, 780)
         .text('Class Teacher\'s Signature', 40, 792);

      doc.text('__________________________', 380, 780)
         .text('Head Teacher\'s Signature', 380, 792);

      doc.end();
    });
  }

  _drawBehaviorGrid(doc, y, title, data, xOffset = 40) {
    const width = 240;
    doc.fontSize(9).font('Helvetica-Bold').text(title, xOffset, y);
    
    const headers = ['EXCELLENT', 'GOOD', 'FAIR', 'POOR'];
    let curY = y + 15;
    
    
    doc.rect(xOffset, curY, width, 15).stroke();
    headers.forEach((h, i) => {
      doc.fontSize(6).text(h, xOffset + 100 + (i * 35), curY + 5);
    });

    const traits = title.includes('PSYCHOMOTOR') 
      ? ['Writing Skill', 'Reading Fluency', 'Musical Skill', 'Creative Skills']
      : ['Punctuality', 'Attendance', 'Neatness', 'Politeness'];

    traits.forEach(trait => {
      curY += 15;
      doc.rect(xOffset, curY, width, 15).stroke();
      doc.fontSize(8).font('Helvetica').text(trait, xOffset + 5, curY + 5);
      
      const rating = data[trait.toLowerCase().replace(' ', '')];
      if (rating) {
        const tickIdx = headers.indexOf(rating.toUpperCase());
        if (tickIdx !== -1) doc.text('X', xOffset + 115 + (tickIdx * 35), curY + 5);
      }
    });
  }
}