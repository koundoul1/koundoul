export interface InscriptionData {
  numero_dossier: string
  nom_entreprise: string
  categorie: string
  domaine_complet: string
  slogan: string
  description?: string
  email: string
  telephone: string
  telephone_2?: string
  whatsapp?: string
  adresse: string
  horaires?: string
  services?: string
  fourchette_prix?: string
  responsable_nom?: string
  responsable_fonction?: string
  template_choisi?: string
  options_premium?: string
  facebook?: string
  instagram?: string
  linkedin?: string
}

export function buildClaudePrompt(data: InscriptionData): string {
  return `Génère un site web HTML professionnel pour cette entreprise sénégalaise :

═══════════════════════════════════════════════════
INFORMATIONS BUSINESS
═══════════════════════════════════════════════════
📋 Dossier: ${data.numero_dossier}
🏢 Entreprise: ${data.nom_entreprise}
📂 Catégorie: ${data.categorie}
🌐 Domaine: ${data.domaine_complet}
💬 Slogan: "${data.slogan}"
${data.description ? `📝 Description: ${data.description}` : ''}

═══════════════════════════════════════════════════
CONTACT
═══════════════════════════════════════════════════
📧 Email: ${data.email}
📞 Téléphone: ${data.telephone}
${data.telephone_2 ? `📱 Tél. 2: ${data.telephone_2}` : ''}
${data.whatsapp ? `💬 WhatsApp: ${data.whatsapp}` : ''}
📍 Adresse: ${data.adresse}

${data.horaires ? `═══════════════════════════════════════════════════
HORAIRES
═══════════════════════════════════════════════════
${data.horaires}` : ''}

${data.services ? `═══════════════════════════════════════════════════
SERVICES/PRODUITS
═══════════════════════════════════════════════════
${data.services}` : ''}
${data.fourchette_prix ? `💰 Prix: ${data.fourchette_prix}` : ''}

${data.responsable_nom ? `═══════════════════════════════════════════════════
RESPONSABLE
═══════════════════════════════════════════════════
👤 ${data.responsable_nom}${data.responsable_fonction ? ` - ${data.responsable_fonction}` : ''}` : ''}

═══════════════════════════════════════════════════
INSTRUCTIONS DE GÉNÉRATION
═══════════════════════════════════════════════════

Crée un site web HTML5 COMPLET avec ces caractéristiques :

🎨 DESIGN:
- Style adapté à la catégorie "${data.categorie}"
- Couleurs professionnelles selon le secteur
- Typographie premium (Google Fonts)
- 100% responsive (mobile-first)
- Animations CSS subtiles et élégantes

📐 STRUCTURE:
1. Header fixe avec navigation smooth
2. Hero section fullscreen avec slogan impactant
3. Section À propos / Présentation entreprise
4. Section Services/Produits (grid de cards professionnelles)
5. Section Témoignages clients (si pertinent)
6. Section Galerie photos (placeholders Unsplash)
7. Section Contact (formulaire + carte + infos)
8. Footer complet avec réseaux sociaux
${data.whatsapp ? `9. Bouton WhatsApp flottant animé (${data.whatsapp})` : ''}

⚙️ TECHNIQUE:
- HTML5 sémantique (header, nav, section, article, footer)
- CSS inline dans <style> (fichier unique)
- JavaScript vanilla minimal pour interactions
- Formulaire action="mailto:${data.email}"
- Images: placeholders Unsplash haute qualité adaptés au secteur
- Performance optimisée (pas de dépendances lourdes)
- SEO-friendly (meta tags complets, Open Graph)
- Accessibilité (alt texts, ARIA labels)

🎨 PALETTE COULEURS SELON CATÉGORIE:
${getCategoryColors(data.categorie)}

🚫 IMPORTANT:
- Ne PAS inclure de texte avant/après le HTML
- Retourner UNIQUEMENT le code HTML pur
- Pas de markdown, pas de \`\`\`html\`\`\`
- Un seul fichier HTML complet
- Prêt à déployer immédiatement

Génère le site maintenant.`
}

function getCategoryColors(categorie: string): string {
  const colors: Record<string, string> = {
    'Artisanat': 'Tons chauds (marron #8B4513, terracotta #D2691E, or #DAA520, crème #F5E6D3)',
    'Services professionnels': 'Corporate (bleu marine #0f172a, bleu #3b82f6, or #d4af37)',
    'Santé': 'Médical (bleu #1e40af, vert #10b981, cyan #06b6d4)',
    'Éducation / Formation': 'Académique (bleu marine #1e3a5f, or #c9a227, turquoise #1abc9c)',
    'Restaurant / Hôtellerie': 'Gastronomique (or #c9a227, gris foncé #2c3e50, rouge #e74c3c)',
    'Commerce': 'Dynamique (rouge #ff6b6b, cyan #4ecdc4, jaune #ffe66d)'
  }
  return colors[categorie] || colors['Services professionnels']
}

export function copyToClipboard(text: string): boolean {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(text)
    return true
  }
  return false
}
