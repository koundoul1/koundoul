import prismaService from '../../src/database/prisma.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const prisma = prismaService.client || prismaService;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function seedAllLessons() {
  console.log('🌱 Chargement de toutes les leçons depuis les fichiers de métadonnées...');
  
  try {
    // Lire tous les dossiers dans prisma/seeds
    const seedsDir = path.join(__dirname);
    const folders = fs.readdirSync(seedsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);
    
    console.log(`📂 ${folders.length} dossiers trouvés`);
    
    let loadedCount = 0;
    let errorCount = 0;
    const errors = [];
    
    // Créer ou récupérer la matière Mathématiques
    const math = await prisma.subject.upsert({
      where: { slug: 'mathematiques' },
      update: {},
      create: {
        name: 'Mathématiques',
        slug: 'mathematiques',
        icon: '📐',
        description: 'Algèbre, Analyse, Géométrie et Probabilités',
        color: '#3B82F6',
        order: 1
      }
    });
    
    // Créer ou récupérer la matière Physique
    const physics = await prisma.subject.upsert({
      where: { slug: 'physics' },
      update: {},
      create: {
        name: 'Physique',
        slug: 'physics',
        icon: '⚛️',
        description: 'Mécanique, Électromagnétisme, Thermodynamique',
        color: '#10B981',
        order: 2
      }
    });
    
    // Créer ou récupérer la matière Chimie
    const chemistry = await prisma.subject.upsert({
      where: { slug: 'chemistry' },
      update: {},
      create: {
        name: 'Chimie',
        slug: 'chemistry',
        icon: '🧪',
        description: 'Chimie organique, Inorganique, Physico-chimie',
        color: '#8B5CF6',
        order: 3
      }
    });
    
    const subjectMap = {
      'math': math.id,
      'mathematiques': math.id,
      'physique': physics.id,
      'physics': physics.id,
      'chemistry': chemistry.id,
      'chimie': chemistry.id
    };
    
    const levelMap = {
      'seconde': 'SECONDE',
      'premiere': 'PREMIERE',
      'terminale': 'TERMINALE'
    };
    
    // Traiter chaque dossier
    for (const folderName of folders) {
      const folderPath = path.join(seedsDir, folderName);
      const metadataPath = path.join(folderPath, 'metadata.json');
      
      if (!fs.existsSync(metadataPath)) {
        continue; // Passer les dossiers sans metadata.json
      }
      
      try {
        // Lire et nettoyer le contenu JSON
        let content = fs.readFileSync(metadataPath, 'utf-8');
        // Retirer les caractères BOM et espaces au début
        content = content.replace(/^\uFEFF/, '').trim();
        const metadata = JSON.parse(content);
        
        // Lire le contenu de la leçon si disponible
        let lessonContent = '';
        const lessonPath = path.join(folderPath, 'lesson.md');
        if (fs.existsSync(lessonPath)) {
          lessonContent = fs.readFileSync(lessonPath, 'utf-8');
        }
        
        // Déterminer le sujet
        const subjectId = subjectMap[metadata.subject] || math.id;
        
        // Déterminer le niveau
        const level = levelMap[metadata.level] || 'SECONDE';
        
        // Créer ou récupérer le chapitre
        const chapterSlug = metadata.chapter?.toLowerCase().replace(/\s+/g, '-') || folderName;
        const chapterTitle = metadata.chapter || 'Général';
        
        const chapter = await prisma.chapter.upsert({
          where: {
            subjectId_slug: {
              subjectId: subjectId,
              slug: chapterSlug
            }
          },
          update: {},
          create: {
            title: chapterTitle,
            slug: chapterSlug,
            description: `Chapitre: ${chapterTitle}`,
            level: level,
            subjectId: subjectId,
            order: 1
          }
        });
        
        // Extraire le titre et les objectifs depuis les métadonnées
        const title = metadata.title || folderName;
        const objectives = metadata.objectives || ['Comprendre le concept'];
        const summary = metadata.realWorldApp || 'Apprendre et comprendre';
        
        // Créer la leçon
        await prisma.lesson.upsert({
          where: {
            chapterId_slug: {
              chapterId: chapter.id,
              slug: metadata.id || folderName
            }
          },
          update: {
            title: title,
            content: lessonContent || `# ${title}\n\n${summary}`,
            summary: summary,
            duration: metadata.duration || 8,
            order: 1
          },
          create: {
            title: title,
            slug: metadata.id || folderName,
            content: lessonContent || `# ${title}\n\n${summary}`,
            summary: summary,
            duration: metadata.duration || 8,
            objectives: objectives,
            chapterId: chapter.id,
            order: 1
          }
        });
        
        loadedCount++;
        
        if (loadedCount % 50 === 0) {
          console.log(`✅ ${loadedCount} leçons chargées...`);
        }
        
      } catch (error) {
        errorCount++;
        errors.push({ folder: folderName, error: error.message });
        console.error(`❌ Erreur pour ${folderName}:`, error.message);
      }
    }
    
    console.log(`\n✅ Seed terminé !`);
    console.log(`📊 ${loadedCount} leçons chargées avec succès`);
    
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} erreurs rencontrées`);
      console.log('Erreurs:', errors);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors du chargement des leçons:', error);
    throw error;
  }
}

