const PDFDocument = require('pdfkit');

exports.generatePDFReport = (res, title, headers, rows) => {
  const doc = new PDFDocument({ margin: 30 });

  // Stream PDF directly to client response
  doc.pipe(res);

  // Header styling
  doc.fillColor('#1f2937')
     .fontSize(22)
     .text('TransitOps Transport operational Report', { align: 'center' });
  doc.fontSize(14)
     .fillColor('#6b7280')
     .text(title, { align: 'center' })
     .moveDown();

  doc.fontSize(10)
     .fillColor('#9ca3af')
     .text(`Generated: ${new Date().toLocaleString()}`, { align: 'right' })
     .moveDown(2);

  // Simple Table design
  const startX = 30;
  let startY = doc.y;
  const colWidth = 550 / headers.length;

  // Print Header Row
  doc.fillColor('#4b5563').font('Helvetica-Bold');
  headers.forEach((header, index) => {
    doc.text(header, startX + index * colWidth, startY, {
      width: colWidth,
      align: 'left'
    });
  });

  // Divider
  doc.moveTo(startX, startY + 15)
     .lineTo(580, startY + 15)
     .strokeColor('#e5e7eb')
     .stroke();

  startY += 25;
  doc.font('Helvetica').fillColor('#374151');

  // Print Data Rows
  rows.forEach((row) => {
    // If page is getting full, start new page
    if (startY > 700) {
      doc.addPage();
      startY = 40;
    }

    row.forEach((cell, cellIndex) => {
      doc.text(String(cell), startX + cellIndex * colWidth, startY, {
        width: colWidth,
        align: 'left'
      });
    });

    startY += 20;
  });

  // End and finalize PDF
  doc.end();
};
