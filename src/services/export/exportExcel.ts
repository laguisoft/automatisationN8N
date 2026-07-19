import ExcelJS from 'exceljs';
import type { Prospect } from '../../types';

/** Genere un classeur Excel (.xlsx) contenant la liste des prospects. */
export async function exportProspectsToExcel(prospects: Prospect[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Laguisoft Lead Finder';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Prospects');
  sheet.columns = [
    { header: 'Entreprise', key: 'companyName', width: 30 },
    { header: 'Ville', key: 'city', width: 15 },
    { header: 'Secteur', key: 'sector', width: 18 },
    { header: 'Telephone', key: 'phone', width: 16 },
    { header: 'Email', key: 'email', width: 25 },
    { header: 'Site web', key: 'website', width: 25 },
    { header: 'Score', key: 'score', width: 8 },
    { header: 'Potentiel', key: 'commercialPotential', width: 12 },
    { header: 'Urgence', key: 'urgency', width: 12 },
    { header: 'Statut', key: 'status', width: 18 },
    { header: 'Besoins probables', key: 'probableNeeds', width: 30 },
    { header: 'Raison du score', key: 'scoreReason', width: 40 },
    { header: 'Cree le', key: 'createdAt', width: 20 },
  ];
  sheet.getRow(1).font = { bold: true };

  for (const prospect of prospects) {
    sheet.addRow({
      companyName: prospect.companyName,
      city: prospect.city ?? '',
      sector: prospect.sector ?? '',
      phone: prospect.phone ?? '',
      email: prospect.email ?? '',
      website: prospect.website ?? '',
      score: prospect.score,
      commercialPotential: prospect.commercialPotential,
      urgency: prospect.urgency,
      status: prospect.status,
      probableNeeds: prospect.probableNeeds.join(', '),
      scoreReason: prospect.scoreReason,
      createdAt: prospect.createdAt.toISOString(),
    });
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}
