# Script pour générer les 317 leçons restantes

# Liste complète des thèmes à couvrir
$themes = @(
    # Algèbre - 50 leçons
    @('algebre-factorisation', 'algebre-developpement', 'identites-remarquables', 'resoudre-inequations', 'systemes-equations', 'inequations-lineaires', 'equations-degre-un', 'calcul-litteral', 'double-distributivite', 'equations-rationnelles'),
    @('fractions', 'nombres-rationnels', 'nombres-irrationnels', 'operations-radicaux', 'simplifier-racines', 'ratio-proportion', 'pourcentages', 'taux-variation', 'coefficient-directeur', 'pente-droite'),
    @('fonction-lineaire', 'fonction-affine-generalisee', 'propriete-fonction', 'composition-fonctions', 'fonction-reciproque', 'transformation-graphique', 'symetrie-axe', 'translation-verticale', 'translation-horizontale', 'homothetie'),
    @('tableaux-variations', 'tableau-signes', 'zero-fonction', 'extremum-local', 'convexite', 'concavite', 'point-inflection', 'asymptote-verticale', 'asymptote-horizontale', 'asymptote-oblique'),
    @('limites-infinies', 'limites-zero', 'limite-quotient', 'formes-indeterminees', 'derives-usuelles', 'derive-ln', 'derive-cos', 'derive-sin', 'derive-tan', 'derive-cot'),

    # Géométrie - 50 leçons
    @('triangle-pythagore', 'theoreme-thales', 'triangles-semblables', 'triangles-egaux', 'hauteur-triangle', 'mediane-triangle', 'bissectrice', 'mediatrice', 'cercle-inscrit', 'cercle-circonscrit'),
    @('polygones-reguliers', 'perimetres', 'aires-figures', 'volume-solides', 'prisme-droit', 'pyramide', 'cone', 'sphere', 'cylindre', 'theoreme-sphere'),
    @('coordonnees', 'repere-orthonorme', 'distance-points', 'milieu-segment', 'vecteur-oppose', 'egalite-vecteurs', 'multiplication-vecteur', 'addition-vecteurs', 'soustraction-vecteurs', 'norme-unite'),
    @('projection-orthogonale', 'produit-mixte', 'equation-plan', 'distances-point-plan', 'angles-vecteurs', 'cosinus-direction', 'equation-parametrique', 'droite-espace', 'orthogonalite', 'parallelisme-espace'),
    @('symetrie-axiale', 'symetrie-centrale', 'rotation', 'homothetie-geometrie', 'translation-geometrie', 'agrandissement', 'reduction', 'echelle', 'plan-construction', 'tracage-geometrique'),

    # Trigonométrie - 30 leçons
    @('angle-degre', 'angle-radian', 'conversion-degre-radian', 'cercle-unite', 'angle-oriente', 'mesure-angle', 'cosinus-theoreme', 'sinus-theoreme', 'regle-cosinus', 'regle-sinus'),
    @('identites-trigonometriques', 'formules-demivation', 'formules-addition-sinus', 'formules-addition-cosinus', 'formules-double-angle', 'formules-moitie-angle', 'equation-cosinus', 'equation-sinus', 'inverse-trigonometrie', 'applications-trigonometrie'),
    @('fonction-cosinus', 'fonction-sinus', 'fonction-tangente', 'fonction-arccos', 'fonction-arcsin', 'fonction-arctan', 'periodicite', 'symetries-trigonometrie', 'valeurs-remarquables', 'calcul-trigonometrie'),

    # Probabilités & Statistiques - 40 leçons
    @('autres-nombres', 'loi-poisson', 'loi-geometrique', 'loi-hypergeometrique', 'loi-normale-standard', 'loi-normale-generale', 'utiliser-tables', 'intervalle-confiance', 'test-hypothese', 'chi-deux'),
    @('moyenne-arithmetique', 'mediane', 'mode', 'quartiles', 'ecart-type', 'variance', 'etendue', 'coefficient-variation', 'boites-moustaches', 'diagrammes-statistiques'),
    @('probabilite-conditionnelle', 'independance', 'theoreme-bayes', 'formule-probabilites-totales', 'schemas-bernoulli', 'loi-grands-nombres', 'convergence-probabilite', 'limite-probabilite', 'preuve-statistique', 'inférence-statistique'),
    @('echantillonnage', 'population-echantillon', 'biais-echantillonnage', 'erreurs-sondage', 'marge-erreur', 'niveau-confiance', 'taille-echantillon', 'sondages-representatifs', 'statistiques-descriptives', 'statistiques-inferentielles'),

    # Analyse - 30 leçons
    @('fonction-continue', 'definition-continuite', 'discontinuites', 'removable-discontinuity', 'jump-discontinuity', 'discontinuite-infinite', 'proprietes-continuite', 'continuite-intervalle', 'theoreme-bolzano', 'theoreme-weierstrass'),
    @('derive-second-derivée-troisieme', 'derivees-ordre-superieur', 'polynome-taylor', 'reste-taylor', 'approximation-taylor', 'developpement-limités', 'equivalences-locales', 'notations-bachmann', 'croissance-comparée-limites', 'recherche-asymptotes'),
    @('integrales-definies', 'methode-rectangles', 'methode-trapezes', 'methode-simpson', 'integraptions-remplacement', 'integrale-fonction-rationnelle', 'integrale-fonction-trigonometrique', 'primitive-logarithmique', 'primitive-exponentielle', 'principes-integration'),

    # Complexes et Equations - 30 lecons
    @('notations', 'forme-exponentielle', 'racines-lunite', 'equation-exponentielle-complexe', 'theoreme-de-moivre', 'theoreme-deuler', 'représentation-complexe', 'operations-complexes-base', 'puissances-complexes', 'racines-nteme'),
    @('factorisation-complexes', 'resolution-equations-complexes', 'equation-second-degre-complexe-general', 'lieux-geometriques-complexes', 'transformations-complexes', 'serie-geometrique-complexe', 'convergence-complexes', 'fonctions-complexes', 'derivees-complexes', 'integrales-complexes'),

    # Physique - 40 leçons
    @('cinematique-position', 'vitesse-instantanee', 'acceleration', 'mouvement-uniforme', 'mouvement-uniformement-accelere', 'chute-libre', 'mouvement-parabolique', 'composition-mouvements', 'reference-galilee', 'reference-relatif'),
    @('forces-gravitation', 'forces-frottement', 'forces-elasticite', 'forces-tension', 'force-normale', 'principe-inertie', 'principe-dynamique', 'principe-actions-reciproques', 'theoreme-moment-cinetique', 'theoreme-energie-cinetique'),
    @('energie-potentielle', 'energie-mecanique', 'conservation-energie', 'dissipation-energie', 'travail-force', 'puissance-mecanique', 'rendement', 'problemes-energie', 'choc-élastique', 'choc-inelastique'),
    @('circuits-equivalents', 'lois-kirchhoff', 'theoreme-thevenin', 'theoreme-norton', 'associations-resistances', 'associations-condensateurs', 'associations-bobines', 'impedance', 'resonance', 'oscillations-electriques'),

    # Chimie - 27 leçons
    @('structure-atome', 'noyau-atomique', 'electron', 'isotopes', 'ions', 'charges-atomiques', 'constituants-matiere', 'etats-matiere', 'changements-etat', 'modeles-atomiques'),
    @('liaison-ionique', 'liaison-covalente', 'liaison-metallique', 'forces-intermoleculaires', 'geometrie-moleculaire', 'hybridation', 'formule-developpée', 'formule-semi-developpée', 'formule-topologique', 'nomenclature-organique'),
    @('vitesse-reaction', 'facteurs-cinétiques', 'loi-cinétique', 'ordre-reaction', 'energie-activation', 'catalyse', 'mechanisme-reaction', 'equilibre-dynamique', 'loi-action-masses', 'principe-lechatelier'),
    @('ph-solutions', 'acides-forts', 'bases-fortes', 'acides-faibles', 'bases-faibles', 'solutions-tampon', 'titrages', 'courbes-titrage', 'indicateurs', 'ph-mesure')
)

# Aplatir la liste
$allThemes = $themes | ForEach-Object { $_ }

Write-Output "Génération de $($allThemes.Count) nouvelles leçons..."

foreach($theme in $allThemes) {
    $dir = Join-Path . $theme
    if(-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Output "✅ $theme créé"
    }
}

Write-Output "Terminé ! $($allThemes.Count) leçons créées."

