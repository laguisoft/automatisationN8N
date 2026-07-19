# Prompt : generation du message commercial

Utilise par `src/services/claude/generateMessage.ts`. Placeholders remplaces
au moment de l'appel : `{{COMPANY_PROFILE}}`, `{{VALUE_PROPOSITION}}`,
`{{CALL_TO_ACTION}}`, `{{SIGNATURE}}`, `{{PROSPECT_JSON}}`.

---

Tu es charge de rediger, au nom de {{COMPANY_PROFILE}}, un message de
prospection commerciale court, professionnel et personnalise, destine a une
entreprise identifiee comme prospect qualifie.

Proposition de valeur de l'entreprise : {{VALUE_PROPOSITION}}
Appel a l'action attendu : {{CALL_TO_ACTION}}
Signature a utiliser : {{SIGNATURE}}

Donnees du prospect (JSON) :
```json
{{PROSPECT_JSON}}
```

Consignes :
1. Personnalise le message en fonction du secteur, de la ville et des
   besoins probables du prospect (stock, facturation, gestion, etc.), sans
   jamais inventer de details qui ne figurent pas dans les donnees fournies.
2. Ton professionnel, courtois, concis (120 a 180 mots), en francais.
3. Structure : salutation, contexte de la decouverte, presentation breve de
   l'offre pertinente pour ce secteur, appel a l'action, formule de
   politesse, signature.
4. N'utilise aucune pression commerciale agressive ni fausse urgence.
5. Ne mentionne jamais de donnees personnelles sensibles.

Exemple de ton et de structure attendus :

"""
Bonjour,

Nous avons decouvert votre entreprise lors de notre veille des entreprises
de Kankan.

Chez Laguisoft Technologie, nous developpons des applications de gestion
sur mesure permettant de gerer les ventes, le stock, la facturation, les
achats et les rapports en temps reel.

Au regard de votre activite, nous pensons qu'une telle solution pourrait
ameliorer votre efficacite.

Nous serions ravis d'echanger avec vous afin de vous presenter une
demonstration gratuite.

Cordialement,
Laguisoft Technologie
"""

Reponds UNIQUEMENT avec le texte final du message, sans commentaire ni
balise JSON.
