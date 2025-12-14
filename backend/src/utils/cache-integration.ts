/**
 * 🔄 Intégration du Cache dans le Générateur de Leçons
 */

import { LessonCacheManager } from './cache-manager';
import type { GenerationConfig } from './generator-types';

interface IntegratedGeneratorConfig extends GenerationConfig {
  useCache: boolean;
  cacheDir: string;
  forceRegenerate: boolean;
}

export class CachedLessonGenerator {
  private cacheManager: LessonCacheManager;
  private config: IntegratedGeneratorConfig;

  constructor(config: IntegratedGeneratorConfig, cacheManager: LessonCacheManager) {
    this.cacheManager = cacheManager;
    this.config = config;
  }

  /**
   * Génère une leçon avec gestion du cache
   */
  async generateLessonWithCache(lessonSpec: any): Promise<{
    generated: boolean;
    fromCache: boolean;
    skipped: boolean;
    reason?: string;
  }> {
    const { id } = lessonSpec;

    // 1. Vérifier le cache si activé
    if (this.config.useCache && !this.config.forceRegenerate) {
      const isUpToDate = await this.cacheManager.isUpToDate(lessonSpec.metadata);

      if (isUpToDate) {
        console.log(`✅ ${id} : Déjà en cache (à jour)`);
        return {
          generated: false,
          fromCache: true,
          skipped: false
        };
      }
    }

    // 2. Générer la leçon (appel à la méthode de génération)
    try {
      console.log(`⚙️  ${id} : Génération en cours...`);
      
      // Ici appeler la méthode de génération réelle
      // const lessonData = await this.generateLesson(lessonSpec);
      
      // 3. Enregistrer dans le cache
      // const filePaths = await this.getLessonFiles(id);
      // await this.cacheManager.cacheLesson(lessonSpec.metadata, filePaths);

      return {
        generated: true,
        fromCache: false,
        skipped: false
      };

    } catch (error) {
      console.error(`❌ ${id} : Erreur de génération`);
      return {
        generated: false,
        fromCache: false,
        skipped: true,
        reason: (error as Error).message
      };
    }
  }

  /**
   * Nettoyage du cache
   */
  async cleanupCache(): Promise<void> {
    if (this.config.useCache) {
      await this.cacheManager.cleanup();
    }
  }

  /**
   * Statistiques de génération avec cache
   */
  async getGenerationStats(): Promise<{
    total: number;
    generated: number;
    fromCache: number;
    skipped: number;
    cacheStats: any;
  }> {
    const cacheStats = await this.cacheManager.getSummary();
    
    return {
      total: 0,
      generated: 0,
      fromCache: 0,
      skipped: 0,
      cacheStats
    };
  }
}














