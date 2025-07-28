// API utility functions for backend communication

const API_BASE_URL = 'https://epileptic-seizure-prediction-system.onrender.com';

export interface PredictionRequest {
  eeg: File;
  mri: File;
  fmri: File;
}

export interface PredictionResponse {
  prediction?: {
    seizure_probability: number;
    seizure_type: string;
  };
  error?: string;
}

export const predictSeizure = async (files: PredictionRequest): Promise<PredictionResponse> => {
  const formData = new FormData();
  formData.append('eeg', files.eeg);
  formData.append('mri', files.mri);
  formData.append('fmri', files.fmri);

  const response = await fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/docs`);
    return response.ok;
  } catch {
    return false;
  }
};