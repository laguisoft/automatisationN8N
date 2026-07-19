process.env.DASHBOARD_API_KEY = 'test-dashboard-api-key';
process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';
process.env.PIPELINE_REQUIRE_HUMAN_VALIDATION = 'true';
process.env.WHATSAPP_REQUIRE_OPT_IN = 'true';
process.env.WHATSAPP_ENABLED = 'true';
process.env.SMTP_ENABLED = 'true';

jest.mock('../../src/services/messaging/emailSender', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('../../src/services/messaging/whatsappSender', () => ({
  sendWhatsAppMessage: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('../../src/services/messaging/contactFormSubmitter', () => ({
  submitContactForm: jest.fn().mockResolvedValue({ success: false, error: 'non automatise' }),
}));

import {
  dispatchMessage,
  ProspectNotValidatedError,
  ConsentRequiredError,
} from '../../src/services/messaging/messageDispatcher';
import { sendEmail } from '../../src/services/messaging/emailSender';
import { sendWhatsAppMessage } from '../../src/services/messaging/whatsappSender';
import type { Prospect } from '../../src/types';

function makeProspect(overrides: Partial<Prospect> = {}): Prospect {
  return {
    id: 'p1',
    companyName: 'Boutique Test',
    city: 'Kankan',
    sector: 'boutiques',
    address: null,
    phone: '+224622123456',
    email: 'contact@exemple.com',
    website: null,
    facebookUrl: null,
    linkedinUrl: null,
    description: null,
    probableNeeds: [],
    currentSoftware: null,
    commercialPotential: 'moyen',
    urgency: 'moyenne',
    score: 80,
    scoreReason: 'Test',
    scoreBreakdown: {
      locatedInKankan: true,
      emailFound: true,
      phoneFound: true,
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
    dedupHash: 'hash',
    status: 'validated',
    generatedMessage: 'Bonjour, ...',
    validatedBy: 'test',
    validatedAt: new Date(),
    sentAt: null,
    sentChannel: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function makeMockRepos() {
  return {
    prospectRepository: { markSent: jest.fn().mockResolvedValue(undefined) },
    messageLogRepository: { record: jest.fn().mockResolvedValue(undefined) },
  };
}

describe('dispatchMessage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('refuses to send when the prospect has not been validated', async () => {
    const prospect = makeProspect({ status: 'pending_validation' });
    await expect(
      dispatchMessage(prospect, { channel: 'email' }, makeMockRepos() as never),
    ).rejects.toBeInstanceOf(ProspectNotValidatedError);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('refuses to send WhatsApp without explicit consent confirmation', async () => {
    const prospect = makeProspect();
    await expect(
      dispatchMessage(prospect, { channel: 'whatsapp' }, makeMockRepos() as never),
    ).rejects.toBeInstanceOf(ConsentRequiredError);
    expect(sendWhatsAppMessage).not.toHaveBeenCalled();
  });

  it('sends WhatsApp once consent is explicitly confirmed', async () => {
    const prospect = makeProspect();
    const repos = makeMockRepos();
    const result = await dispatchMessage(
      prospect,
      { channel: 'whatsapp', whatsappConsentConfirmed: true },
      repos as never,
    );
    expect(result.success).toBe(true);
    expect(sendWhatsAppMessage).toHaveBeenCalledWith({ to: prospect.phone, text: prospect.generatedMessage });
    expect(repos.messageLogRepository.record).toHaveBeenCalled();
    expect(repos.prospectRepository.markSent).toHaveBeenCalledWith(prospect.id, 'whatsapp');
  });

  it('sends email for a validated prospect without extra confirmation', async () => {
    const prospect = makeProspect();
    const repos = makeMockRepos();
    const result = await dispatchMessage(prospect, { channel: 'email' }, repos as never);
    expect(result.success).toBe(true);
    expect(sendEmail).toHaveBeenCalled();
  });
});
