import numpy as np

def predict_seizure(eeg_array, mri_array, fmri_array):
    """
    Dummy multi-branch model placeholder.
    Replace with your real 3D CNN + fusion model.
    """
    # For now, return fake result:
    probability = np.random.uniform(0.7, 0.95)
    seizure_type = "Focal Seizure"

    return {
        "seizure_probability": float(round(probability, 2)),
        "seizure_type": seizure_type
    }