/**
 * 🗄️ Système de Cache pour Micro-Leçons
 * Évite de régénérer les leçons déjà existantes
 */

import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

interface LessonMetadata {
  id: string;
  title: string;
  subject: string;
  level: string;
  chapter: string;
  duration: number;
  prerequisites: string[];
  objectives: string[];
  difficulty: number;
  xpReward: number;
  realWorldApp?: string;
  keywords?: string[];
}

interface CacheEntry {
  lessonId: string;
  metadataHash: string;
  contentHash: string;
  generatedAt: string;
  filePaths: string[];
  lastModified: string;
}

interface CacheManagerConfig {
  cacheDir: string;
  outputDir: string;
}

export class LessonCacheManager {
  private config: CacheManagerConfig;
  private cacheFilePath: string;
  private cacheData: Map<string, CacheEntry> = new Map();

  constructor(config: CacheManagerConfig) {
    this.config = config;
    this.cacheFilePath = path.join(config.cacheDir, 'lessons-cache.json');
  }

  /**
   * Initialise le cache en chargeant les données existantes
   */
  async initialize(): Promise<void> {
    try {
      const data = await fs.readFile(this.cacheFilePath, 'utf-8');
      const entries: CacheEntry[] = JSON.parse(data);
      
      for (const entry of entries) {
        this.cacheData.set(entry.lessonId, entry);
      }
      
      console.log(`📦 Cache chargé : ${this.cacheData.size} leçons enregistrées`);
    } catch (error) {
      console.log('🆕 Création d\'un nouveau cache');
      await fs.mkdir(this.config.cacheDir, { recursive: true });
    }
  }

  /**
   * Génère un hash SHA-256 des métadonnées
   */
  private generateMetadataHash(metadata: LessonMetadata): string {
    const content = JSON.stringify(metadata);
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  /**
   * Génère un hash du contenu de la leçon
   */
  async generateContentHash(lessonId: string): Promise<string | null> {
    const lessonDir = path.join(this.config.outputDir, 'lessons', lessonId);
    
    try {
      const files = await this.getAllFiles(lessonDir);
      const hashes = await Promise.all(
        files.map(async (file) => {
          const content = await fs.readFile(file, 'utf-8');
          return crypto.createHash('sha256').update(content).digest('hex');
        })
      );
      
      return crypto.createHash('sha256').update(hashes.join('')).digest('hex');
    } catch {
      return null;
    }
  }

  /**
   * Vérifie si une leçon existe déjà et est à jour
   */
  async isUpToDate(metadata: LessonMetadata): Promise<boolean> {
    const lessonId = metadata.id;
    const cachedEntry = this.cacheData.get(lessonId);

    if (!cachedEntry) {
      return false; // Pas de cache = doit être généré
    }

    // 1. Vérifier le hash des métadonnées
    const currentMetadataHash = this.generateMetadataHash(metadata);
    if (cachedEntry.metadataHash !== currentMetadataHash) {
      console.log(`⚠️  Métadonnées modifiées pour ${lessonId}`);
      return false;
    }

    // 2. Vérifier que tous les fichiers existent encore
    for (const filePath of cachedEntry.filePaths) {
      try {
        await fs.access(filePath);
      } catch {
        console.log(`⚠️  Fichier manquant : ${filePath}`);
        return false;
      }
    }

    // 3. Vérifier le hash du contenu actuel
    const currentContentHash = await this.generateContentHash(lessonId);
    if (currentContentHash && cachedEntry.contentHash !== currentContentHash) {
      console.log(`⚠️  Contenu modifié pour ${lessonId}`);
      return false;
    }

    return true; // À jour !
  }

  /**
   * Enregistre une leçon dans le cache
   */
  async cacheLesson(
    metadata: LessonMetadata,
    filePaths: string[]
  ): Promise<void> {
    const lessonId = metadata.id;
    const metadataHash = this.generateMetadataHash(metadata);
    const contentHash = await this.generateContentHash(lessonId);

    const entry: CacheEntry = {
      lessonId,
      metadataHash,
      contentHash: contentHash || '',
      generatedAt: new Date().toISOString(),
      filePaths,
      lastModified: new Date().toISOString()
    };

    this.cacheData.set(lessonId, entry);
    await this.saveCache();
  }

  /**
   * Sauvegarde le cache sur disque
   */
  private async saveCache(): Promise<void> {
    const entries = Array.from(this.cacheData.values());
    await fs.writeFile(
      this.cacheFilePath,
      JSON.stringify(entries, null, 2)
    );
  }

  /**
   * Retourne la liste des fichiers d'une leçon
   */
  private async getAllFiles(dir: string): Promise<string[]> {
    const files: string[] = [];
    
    try {
      const items = await fs.readdir(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = path.join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...await this.getAllFiles(fullPath));
        } else if (item.isFile()) {
          files.push(fullPath);
        }
      }
    } catch {
      // Dossier n'existe pas encore
    }
    
    return files;
  }

  /**
   * Supprime une leçon du cache
   */
  async invalidateLesson(lessonId: string): Promise<void> {
    this.cacheData.delete(lessonId);
    await this.saveCache();
  }

  /**
   * Supprime toutes les leçons obsolètes du cache
   */
  async cleanup(): Promise<void> {
    const entries = Array.from(this.cacheData.entries());
    let removedCount = 0;

    for (const [lessonId, entry] of entries) {
      // Vérifier si tous les fichiers existent encore
      let allExist = true;
      for (const filePath of entry.filePaths) {
        try {
          await fs.access(filePath);
        } catch {
          allExist = false;
          break;
        }
      }

      if (!allExist) {
        this.cacheData.delete(lessonId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      await this.saveCache();
      console.log(`🧹 Nettoyage : ${removedCount} entrées obsolètes supprimées`);
    }
  }

  /**
   * Statistiques du cache
   */
  getStats(): {
    totalEntries: number;
    lastCleanup?: string;
  } {
    return {
      totalEntries: this.cacheData.size
    };
  }

  /**
   * Liste toutes les leçons en cache
   */
  async listCachedLessons(): Promise<string[]> {
    return Array.from(this.cacheData.keys());
  }

  /**
   * Résumé complet du cache
   */
  async getSummary(): Promise<{
    totalLessons: number;
    totalSize: number;
    oldestEntry?: string;
    newestEntry?: string;
  }> {
    const entries = Array.from(this.cacheData.values());
    
    let totalSize = 0;
    for (const entry of entries) {
      for (const filePath of entry.filePaths) {
        try {
          const stats = await fs.stat(filePath);
          totalSize += stats.size;
        } catch {
          // Fichier n'existe plus
        }
      }
    }

    const dates = entries.map(e => new Date(e.generatedAt));
    dates.sort((a, b) => a.getTime() - b.getTime());

    return {
      totalLessons: entries.length,
      totalSize,
      oldestEntry: dates[0]?.toISOString(),
      newestEntry: dates[dates.length - 1]?.toISOString()
    };
  }
}

/**
 * Fonction utilitaire pour obtenir le gestionnaire de cache
 */
export async function getCacheManager(
  cacheDir = './cache',
  outputDir = './output'
): Promise<LessonCacheManager> {
  const manager = new LessonCacheManager({ cacheDir, outputDir });
  await manager.initialize();
  return manager;
}














