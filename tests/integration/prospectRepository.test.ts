/**
 * Test d'integration necessitant une vraie base PostgreSQL migree.
 *
 *   docker compose up -d postgres
 *   npm run migrate
 *   RUN_INTEGRATION_TESTS=true DATABASE_URL=postgresql://llf_user:llf_password@localhost:5432/laguisoft_lead_finder npm run test:integration
 *
 * Ignore silencieusement si RUN_INTEGRATION_TESTS n'est pas defini, pour ne
 * jamais casser `npm test` dans un environnement sans base de donnees.
 */
const runIntegration = process.env.RUN_INTEGRATION_TESTS === 'true';
const describeIntegration = runIntegration ? describe : describe.skip;

describeIntegration('ProspectRepository (integration)', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let repository: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let closePool: any;

  beforeAll(() => {
    process.env.DASHBOARD_API_KEY = process.env.DASHBOARD_API_KEY ?? 'test-dashboard-api-key';
    process.env.REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';
    process.env.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY ?? 'test-anthropic-key';

    // Les imports sont differes (et places ici, pas au niveau du describe)
    // pour eviter d'initialiser le pool PostgreSQL quand la suite est
    // ignoree (pas de base disponible) : describe.skip execute quand meme
    // le corps du describe, mais jamais les hooks ni les tests.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    ({ closePool } = require('../../src/database/pool'));
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ProspectRepository } = require('../../src/database/repositories/prospectRepository');
    repository = new ProspectRepository();
  });

  afterAll(async () => {
    await closePool();
  });

  it('rejects a duplicate dedup_hash at the database level', async () => {
    const input = {
      companyName: 'Test Integration Boutique',
      city: 'Kankan',
      sector: 'boutiques',
      address: null,
      phone: null,
      email: null,
      website: null,
      facebookUrl: null,
      linkedinUrl: null,
      description: null,
      probableNeeds: [],
      currentSoftware: null,
      commercialPotential: 'moyen',
      urgency: 'moyenne',
      score: 30,
      scoreReason: 'test',
      scoreBreakdown: {
        locatedInKankan: true,
        emailFound: false,
        phoneFound: false,
        websiteFound: false,
        activeFacebookPage: false,
        mentionsManagement: false,
        mentionsStock: false,
        mentionsInvoicing: false,
        seekingSoftware: false,
        recentPublication: false,
      },
      sourceUrls: [],
      searchQuery: null,
      dedupHash: `integration-test-${Date.now()}`,
    };

    const created = await repository.create(input, null);
    expect(created.id).toBeDefined();

    await expect(repository.create(input, null)).rejects.toThrow();
  });
});
