import PDFDocument from 'pdfkit';
import type { Prospect } from '../../types';

/** Genere un rapport PDF listant les prospects (une fiche par prospect). */
export function exportProspectsToPdf(prospects: Prospect[]): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(18).text('Laguisoft Lead Finder - Rapport de prospects', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text(`Genere le ${new Date().toLocaleString('fr-FR')}`, {
      align: 'center',
    });
    doc.moveDown(2);
    doc.fillColor('black');

    for (const prospect of prospects) {
      doc
        .fontSize(13)
        .fillColor('black')
        .text(`${prospect.companyName}  -  Score : ${prospect.score}/100`, { underline: true });
      doc.fontSize(10).fillColor('black');
      doc.text(`Ville : ${prospect.city ?? 'N/A'}    Secteur : ${prospect.sector ?? 'N/A'}`);
      doc.text(`Telephone : ${prospect.phone ?? 'N/A'}    Email : ${prospect.email ?? 'N/A'}`);
      if (prospect.website) doc.text(`Site web : ${prospect.website}`);
      doc.text(`Potentiel : ${prospect.commercialPotential}    Urgence : ${prospect.urgency}`);
      if (prospect.probableNeeds.length > 0) {
        doc.text(`Besoins probables : ${prospect.probableNeeds.join(', ')}`);
      }
      doc.text(`Raison du score : ${prospect.scoreReason}`);
      doc.text(`Statut : ${prospect.status}`);
      doc.moveDown(1.2);
      doc
        .moveTo(doc.x, doc.y)
        .lineTo(doc.page.width - doc.page.margins.right, doc.y)
        .strokeColor('#dddddd')
        .stroke();
      doc.moveDown(1);

      if (doc.y > doc.page.height - 120) {
        doc.addPage();
      }
    }

    doc.end();
  });
}
