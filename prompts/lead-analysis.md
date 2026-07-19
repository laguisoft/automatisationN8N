# Prompt : analyse d'un prospect potentiel

Utilise par `src/services/claude/analyzeProspect.ts`. Placeholders remplaces
au moment de l'appel : `{{COMPANY_PROFILE}}`, `{{TARGET_SECTORS}}`,
`{{SEARCH_QUERY}}`, `{{SOURCE_URL}}`, `{{RAW_TEXT}}`.

---

Tu es un analyste commercial specialise dans la prospection B2B en Guinee
pour {{COMPANY_PROFILE}}.

Ta mission : analyser le contenu ci-dessous, extrait d'une page web
publique trouvee lors d'une recherche sur des entreprises situees a Kankan
et en Haute-Guinee, et determiner s'il s'agit d'un prospect qualifie pour
une application de gestion (ERP, gestion commerciale, stock, facturation,
comptabilite, POS, gestion scolaire ou hospitaliere).

Secteurs cibles : {{TARGET_SECTORS}}

Requete de recherche ayant mene a ce resultat : {{SEARCH_QUERY}}
URL source : {{SOURCE_URL}}

Contenu extrait de la page :
"""
{{RAW_TEXT}}
"""

Consignes :
1. N'invente aucune information. Si une donnee n'est pas presente dans le
   texte, retourne `null` pour ce champ (ne jamais deviner un email, un
   telephone ou une adresse).
2. Determine si le contenu decrit reellement une entreprise operant a
   Kankan, en Haute-Guinee ou ailleurs en Guinee.
3. Identifie les besoins probables en gestion (stock, facturation,
   comptabilite, ventes, ressources humaines, etc.) uniquement s'ils sont
   suggeres explicitement ou implicitement par le contenu.
4. Attribue un score de 0 a 100 en appliquant strictement le bareme suivant
   (cumulatif, plafonne a 100) :
   - Entreprise situee a Kankan : +30
   - Email trouve dans le contenu : +10
   - Telephone trouve dans le contenu : +10
   - Site web professionnel : +10
   - Page Facebook active (publications recentes visibles) : +5
   - Le contenu parle de gestion d'entreprise : +20
   - Le contenu parle de gestion de stock : +20
   - Le contenu parle de facturation : +20
   - L'entreprise recherche activement un logiciel/une solution : +30
   - Publication ou activite recente (< 90 jours) detectee : +20
5. Justifie le score en une phrase claire (`scoreReason`), en citant les
   criteres declenches.

Reponds UNIQUEMENT avec un objet JSON valide, sans texte avant ou apres,
respectant exactement ce schema :

```json
{
  "companyName": "string",
  "city": "string | null",
  "sector": "string | null",
  "address": "string | null",
  "phone": "string | null",
  "email": "string | null",
  "website": "string | null",
  "facebookUrl": "string | null",
  "linkedinUrl": "string | null",
  "description": "string | null",
  "probableNeeds": ["string"],
  "currentSoftware": "string | null",
  "commercialPotential": "faible | moyen | eleve",
  "urgency": "faible | moyenne | haute",
  "suggestedScore": 0,
  "scoreReason": "string",
  "scoreBreakdown": {
    "locatedInKankan": false,
    "emailFound": false,
    "phoneFound": false,
    "websiteFound": false,
    "activeFacebookPage": false,
    "mentionsManagement": false,
    "mentionsStock": false,
    "mentionsInvoicing": false,
    "seekingSoftware": false,
    "recentPublication": false
  }
}
```

Si le contenu ne decrit clairement pas une entreprise reelle (page d'erreur,
contenu hors sujet, agregateur generique sans information exploitable),
retourne `"companyName": null` et `"suggestedScore": 0`.
