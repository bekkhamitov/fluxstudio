export interface ReferenceImage {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_url: string;
  storage_path: string;
  created_at: string;
  isPending?: boolean; // True while image is being uploaded/analyzed
}

export interface ReferenceSnapshot {
  id: string;
  name: string;
  description: string | null;
  image_url: string;
}

export interface Generation {
  id: string;
  user_id: string;
  prompt_raw: string;
  prompt_expanded: string;
  reference_image_ids: string[];
  reference_snapshots: ReferenceSnapshot[];
  output_image_url: string;
  output_storage_path: string;
  model: FluxModel;
  seed: number | null;
  created_at: string;
}

export type FluxModel = 'flux-2-pro' | 'flux-2-max' | 'flux-2-flex';

export interface FluxModelOption {
  id: FluxModel;
  name: string;
  description: string;
}

export const FLUX_MODELS: FluxModelOption[] = [
  { id: 'flux-2-pro', name: 'FLUX.2 [pro]', description: 'Fast & efficient (~10s)' },
  { id: 'flux-2-max', name: 'FLUX.2 [max]', description: 'Highest quality (~15s)' },
  { id: 'flux-2-flex', name: 'FLUX.2 [flex]', description: 'Adjustable controls' },
];

export interface ParsedReference {
  name: string;
  id: string;
  position: number;
}

export interface GenerationRequest {
  prompt: string;
  references: ReferenceImage[];
  model: FluxModel;
  width?: number;
  height?: number;
  seed?: number;
}

export interface GenerationStatus {
  status: 'idle' | 'pending' | 'generating' | 'complete' | 'error';
  progress?: number;
  error?: string;
  result?: {
    imageUrl: string;
    generationId: string;
  };
}

export interface ImageAnalysis {
  name: string;
  description: string;
}
