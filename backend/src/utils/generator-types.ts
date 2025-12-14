/**
 * Types TypeScript pour le système de génération de micro-leçons
 */

export interface LessonMetadata {
  id: string;
  title: string;
  subject: 'math' | 'physics' | 'chemistry';
  level: 'seconde' | 'premiere' | 'terminale';
  chapter: string;
  duration: number;
  prerequisites: string[];
  objectives: string[];
  difficulty: number;
  xpReward: number;
  realWorldApp?: string;
  keywords?: string[];
}

export interface LessonPhase {
  type: 'hook' | 'recall' | 'course' | 'method' | 'exercise' | 'quiz' | 'closure';
  duration: number;
  content: any;
  interactions: Interaction[];
}

export interface Interaction {
  type: 'click' | 'input' | 'slider' | 'quiz' | 'drag';
  id: string;
  validation?: (value: any) => boolean;
  feedback: {
    correct: string;
    incorrect: string;
    hint?: string[];
  };
  xpReward?: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 1 | 2 | 3;
  xpReward: number;
}

export interface Asset {
  type: 'animation' | 'graphic' | 'video' | 'image';
  id: string;
  description: string;
  specifications: {
    duration?: number;
    resolution?: string;
    format?: string;
    interactivity?: string[];
  };
}

export interface LessonSpec {
  id: string;
  title: string;
  subject: string;
  level: string;
  chapter: string;
  metadata: any;
  duration: number;
  difficulty: number;
  prerequisites: string[];
  objectives: string[];
  realWorldApp: string;
  keywords: string[];
}

export interface GenerationConfig {
  batchSize: number;
  concurrency: number;
  outputDir: string;
  validateAfterGen: boolean;
  retryOnError: number;
  saveProgress: boolean;
  useCache: boolean;
  cacheDir: string;
  forceRegenerate: boolean;
}

export interface GenerationResult {
  lessonId: string;
  success: boolean;
  fromCache: boolean;
  skipped: boolean;
  reason?: string;
  duration: number;
  timestamp: string;
}

export interface ValidationResult {
  lessonId: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
}

export interface CacheEntry {
  lessonId: string;
  metadataHash: string;
  contentHash: string;
  generatedAt: string;
  filePaths: string[];
  lastModified: string;
}














