/**
 * Insere des prospects d'exemple pour tester le dashboard sans avoir a
 * configurer les cles API de recherche/IA. Usage : npm run seed
 */
import { ProspectRepository } from '../src/database/repositories/prospectRepository';
import { computeDedupHash } from '../src/services/dedup/computeDedupHash';
import { closePool } from '../src/database/pool';
import { logger } from '../src/utils/logger';
import type { NewProspectInput } from '../src/types';

const sampleProspects: Array<Omit<NewProspectInput, 'dedupHash'>> = [
  {
    companyName: 'Pharmacie de la Paix',
    city: 'Kankan',
    sector: 'pharmacies',
    address: 'Quartier Timbo, Kankan',
    phone: '+224622100001',
    email: 'contact@pharmaciedelapaix-kk.example',
    website: null,
    facebookUrl: 'https://facebook.com/pharmaciedelapaix.kankan',
    linkedinUrl: null,
    description: 'Pharmacie de quartier a Kankan, forte frequentation, gestion des stocks manuelle (cahier).',
    probableNeeds: ['gestion de stock', 'facturation'],
    currentSoftware: null,
    commercialPotential: 'eleve',
    urgency: 'haute',
    score: 85,
    scoreReason:
      'Entreprise situee a Kankan (+30), telephone trouve (+10), page Facebook active (+5), parle de gestion de stock (+20), publication recente (+20).',
    scoreBreakdown: {
      locatedInKankan: true,
      emailFound: true,
      phoneFound: true,
      websiteFound: false,
      activeFacebookPage: true,
      mentionsManagement: false,
      mentionsStock: true,
      mentionsInvoicing: false,
      seekingSoftware: false,
      recentPublication: true,
    },
    sourceUrls: ['https://facebook.com/pharmaciedelapaix.kankan'],
    searchQuery: 'pharmacies a Kankan contact',
  },
  {
    companyName: 'Quincaillerie Moderne du Niger',
    city: 'Kankan',
    sector: 'quincailleries',
    address: 'Marche central, Kankan',
    phone: '+224655200002',
    email: null,
    website: 'https://quincaillerie-moderne-niger.example',
    facebookUrl: null,
    linkedinUrl: null,
    description: 'Quincaillerie generaliste recherchant une solution pour la facturation et le suivi des ventes.',
    probableNeeds: ['facturation', 'gestion commerciale'],
    currentSoftware: 'Excel',
    commercialPotential: 'eleve',
    urgency: 'moyenne',
    score: 90,
    scoreReason:
      'Entreprise situee a Kankan (+30), telephone trouve (+10), site web (+10), parle de facturation (+20), recherche un logiciel (+30, plafonne a 100).',
    scoreBreakdown: {
      locatedInKankan: true,
      emailFound: false,
      phoneFound: true,
      websiteFound: true,
      activeFacebookPage: false,
      mentionsManagement: false,
      mentionsStock: false,
      mentionsInvoicing: true,
      seekingSoftware: true,
      recentPublication: false,
    },
    sourceUrls: ['https://quincaillerie-moderne-niger.example'],
    searchQuery: 'quincailleries Kankan Guinee telephone',
  },
  {
    companyName: "Ecole Privee L'Avenir",
    city: 'Kankan',
    sector: 'ecoles',
    address: 'Route de Kissidougou, Kankan',
    phone: null,
    email: 'direction@ecole-avenir-kankan.example',
    website: null,
    facebookUrl: null,
    linkedinUrl: null,
    description: 'Etablissement scolaire prive, gestion des inscriptions et des paiements de scolarite au papier.',
    probableNeeds: ['gestion scolaire', 'facturation'],
    currentSoftware: null,
    commercialPotential: 'moyen',
    urgency: 'moyenne',
    score: 60,
    scoreReason: 'Entreprise situee a Kankan (+30), email trouve (+10), parle de gestion (+20).',
    scoreBreakdown: {
      locatedInKankan: true,
      emailFound: true,
      phoneFound: false,
      websiteFound: false,
      activeFacebookPage: false,
      mentionsManagement: true,
      mentionsStock: false,
      mentionsInvoicing: false,
      seekingSoftware: false,
      recentPublication: false,
    },
    sourceUrls: ['https://annuaire-guinee.example/ecole-avenir-kankan'],
    searchQuery: 'ecoles a Kankan contact',
  },
];

async function seed(): Promise<void> {
  const repository = new ProspectRepository();

  for (const sample of sampleProspects) {
    const dedupHash = computeDedupHash({
      companyName: sample.companyName,
      city: sample.city,
      website: sample.website,
      phone: sample.phone,
    });

    const existing = await repository.findByDedupHash(dedupHash);
    if (existing) {
      logger.info({ companyName: sample.companyName }, 'Prospect exemple deja present, ignore');
      continue;
    }

    const created = await repository.create({ ...sample, dedupHash }, null);
    await repository.updateStatus(created.id, 'pending_validation');
    logger.info({ companyName: created.companyName, score: created.score }, 'Prospect exemple insere');
  }
}

seed()
  .then(async () => {
    logger.info('Seed termine');
    await closePool();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error({ error }, 'Echec du seed');
    await closePool();
    process.exit(1);
  });
