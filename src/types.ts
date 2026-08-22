export type AccessMode = 'unlocked' | 'byok' | 'trial';

export type LegalEngineeringArea = 'laboral' | 'mercantil' | 'fiscal' | 'aduanal' | 'comercio_exterior';

export interface LegalArticle {
  id: string;
  lawCode: string;
  lawName: string;
  articleNumber: string;
  title: string;
  content: string;
  area: LegalEngineeringArea;
  score?: number;
}

export interface SavedCase {
  id: string;
  title: string;
  area: LegalEngineeringArea;
  createdAt: string;
  updatedAt: string;
  draftContent?: string;
}

export interface GoogleAiSettings {
  mode: AccessMode;
  licenseKey?: string;
  apiKey: string;
  model: string;
  strictPrivacy: boolean;
  isConfigured: boolean;
  tutorialCompleted: boolean;
}

export interface PublicTemplate {
  id: string;
  name: string;
  category: LegalEngineeringArea;
  description: string;
  path: string;
  variables?: string[];
  previewContent?: string;
}
