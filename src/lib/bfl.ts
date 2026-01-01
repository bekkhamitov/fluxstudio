import { FluxModel } from '@/types';

const BFL_API_URL = 'https://api.bfl.ai';

interface BflGenerateRequest {
  prompt: string;
  input_image?: string;
  input_image_2?: string;
  input_image_3?: string;
  input_image_4?: string;
  input_image_5?: string;
  input_image_6?: string;
  input_image_7?: string;
  input_image_8?: string;
  width?: number;
  height?: number;
  seed?: number;
  output_format?: 'jpeg' | 'png';
  safety_tolerance?: number;
}

interface BflSubmitResponse {
  id: string;
  polling_url: string;
  cost?: number;
}

interface BflPollResponse {
  status: 'Ready' | 'Pending' | 'Error' | 'Failed' | 'Task not found';
  result?: {
    sample: string;
  };
  error?: string;
}

function getEndpoint(model: FluxModel): string {
  switch (model) {
    case 'flux-2-pro':
      return '/v1/flux-2-pro';
    case 'flux-2-max':
      return '/v1/flux-2-max';
    case 'flux-2-flex':
      return '/v1/flux-2-flex';
    default:
      return '/v1/flux-2-pro';
  }
}

export async function submitGeneration(
  request: BflGenerateRequest,
  model: FluxModel,
  apiKey: string
): Promise<BflSubmitResponse> {
  const endpoint = getEndpoint(model);

  const response = await fetch(`${BFL_API_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'x-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...request,
      output_format: request.output_format || 'png',
      safety_tolerance: request.safety_tolerance ?? 2,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`BFL API error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

export async function pollResult(
  pollingUrl: string,
  apiKey: string
): Promise<BflPollResponse> {
  const response = await fetch(pollingUrl, {
    headers: {
      'accept': 'application/json',
      'x-key': apiKey,
    },
  });

  if (!response.ok) {
    throw new Error(`BFL polling error: ${response.status}`);
  }

  return response.json();
}

export async function waitForResult(
  pollingUrl: string,
  apiKey: string,
  maxAttempts = 120,
  intervalMs = 1000
): Promise<string> {
  for (let i = 0; i < maxAttempts; i++) {
    const result = await pollResult(pollingUrl, apiKey);

    if (result.status === 'Ready' && result.result?.sample) {
      return result.result.sample;
    }

    if (result.status === 'Error' || result.status === 'Failed') {
      throw new Error(result.error || 'Generation failed');
    }

    if (result.status === 'Task not found') {
      throw new Error('Task not found - it may have expired');
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error('Generation timed out');
}

export function buildBflRequest(
  prompt: string,
  imageUrls: string[],
  options?: {
    width?: number;
    height?: number;
    seed?: number;
  }
): BflGenerateRequest {
  const request: BflGenerateRequest = {
    prompt,
    width: options?.width || 1024,
    height: options?.height || 1024,
    seed: options?.seed,
  };

  // Map image URLs to input_image params
  if (imageUrls[0]) request.input_image = imageUrls[0];
  if (imageUrls[1]) request.input_image_2 = imageUrls[1];
  if (imageUrls[2]) request.input_image_3 = imageUrls[2];
  if (imageUrls[3]) request.input_image_4 = imageUrls[3];
  if (imageUrls[4]) request.input_image_5 = imageUrls[4];
  if (imageUrls[5]) request.input_image_6 = imageUrls[5];
  if (imageUrls[6]) request.input_image_7 = imageUrls[6];
  if (imageUrls[7]) request.input_image_8 = imageUrls[7];

  return request;
}
