from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from backend.model import predict_seizure
from backend.data_utils import MedicalDataProcessor
import shutil
import os
import numpy as np

app = FastAPI()

# Allow requests from any frontend (you can restrict this later)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/predict")
async def predict(
    eeg: UploadFile = File(...),
    mri: UploadFile = File(...),
    fmri: UploadFile = File(...)
):
    processor = MedicalDataProcessor()
    
    # Validate file formats
    if not processor.validate_file_format(eeg.filename, 'eeg'):
        return {"error": f"Unsupported EEG file format. Supported: .edf, .bdf, .csv"}
    
    if not processor.validate_file_format(mri.filename, 'mri'):
        return {"error": f"Unsupported MRI file format. Supported: .nii, .nii.gz"}
    
    if not processor.validate_file_format(fmri.filename, 'fmri'):
        return {"error": f"Unsupported fMRI file format. Supported: .nii, .nii.gz"}
    
    # Save uploaded files temporarily
    eeg_path = f"temp_{eeg.filename}"
    mri_path = f"temp_{mri.filename}"
    fmri_path = f"temp_{fmri.filename}"

    with open(eeg_path, "wb") as buffer:
        shutil.copyfileobj(eeg.file, buffer)

    with open(mri_path, "wb") as buffer:
        shutil.copyfileobj(mri.file, buffer)

    with open(fmri_path, "wb") as buffer:
        shutil.copyfileobj(fmri.file, buffer)

    try:
        # Load and preprocess data using utility functions
        eeg_data, eeg_metadata = processor.load_eeg_data(eeg_path)
        mri_data, mri_metadata = processor.load_mri_data(mri_path)
        fmri_data, fmri_metadata = processor.load_fmri_data(fmri_path)
        
        # Preprocess data
        eeg_data = processor.preprocess_eeg(eeg_data, eeg_metadata.get('sampling_rate'))
        mri_data = processor.preprocess_mri(mri_data)
        fmri_data = processor.preprocess_fmri(fmri_data)
        
        # Run prediction
        result = predict_seizure(eeg_data, mri_data, fmri_data)
        
        # Add metadata to result
        result['metadata'] = {
            'eeg': eeg_metadata,
            'mri': mri_metadata,
            'fmri': fmri_metadata
        }
        
    except Exception as e:
        return {"error": f"Processing error: {str(e)}"}

    # Clean up temp files
    os.remove(eeg_path)
    os.remove(mri_path)
    os.remove(fmri_path)

    return {"prediction": result}

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "message": "Seizure prediction API is running"}

@app.get("/")
async def root():
    """Root endpoint with API information"""
    return {
        "message": "Epileptic Seizure Prediction API",
        "version": "1.0.0",
        "endpoints": {
            "predict": "/predict - POST with EEG, MRI, fMRI files",
            "health": "/health - GET health check",
            "docs": "/docs - API documentation"
        }
    }