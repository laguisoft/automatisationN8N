import { logger } from '../../utils/logger';

/**
 * Point d'extension pour la soumission de formulaires de contact publics.
 * Chaque site ayant une structure de formulaire differente, cette fonction
 * ne fait pas d'automatisation generique (qui serait fragile et proche du
 * spam) : elle journalise l'intention d'envoi pour traitement manuel ou
 * pour un connecteur specifique ajoute au cas par cas dans
 * `docs/maintenance.md`.
 */
export async function submitContactForm(params: {
  targetUrl: string;
  message: string;
  companyName: string;
}): Promise<{ success: boolean; error?: string }> {
  logger.info(
    { targetUrl: params.targetUrl, companyName: params.companyName },
    'Soumission de formulaire de contact non automatisee : traitement manuel requis',
  );
  return {
    success: false,
    error:
      'Canal formulaire de contact non automatise par defaut (structure specifique a chaque site). ' +
      'Voir docs/maintenance.md pour ajouter un connecteur dedie.',
  };
}
