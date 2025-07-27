# Backend for Epileptic Seizure Prediction System

## 🧠 Overview

This backend provides a FastAPI server for multi-modal seizure prediction using 3D CNN with MRI, fMRI, and EEG data fusion.

## 📁 File Structure

```
backend/
├── app.py                    # Main FastAPI application
├── model.py                  # ML model and prediction logic
├── data_utils.py            # Medical data processing utilities
├── convert_hdr_to_nii.py    # Batch converter for OASIS data
├── requirements.txt         # Python dependencies
├── start.py                # Server startup script
└── README.md               # This file
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Convert OASIS Data (if needed)

If you have OASIS data with `.hdr` + `.img` pairs, convert them to `.nii` format:

```bash
python convert_hdr_to_nii.py [source_dir] [output_dir]
```

Example:
```bash
python convert_hdr_to_nii.py ./oasis_cross-sectional_disc1 ./converted_nii
```

### 3. Start the Server

```bash
python start.py
```

Or using uvicorn directly:
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## 📡 API Endpoints

### POST `/predict`
Upload medical data files for seizure prediction.

**Request**: Multipart form data with:
- `eeg`: EEG file (.edf, .bdf, .csv)
- `mri`: MRI file (.nii, .nii.gz)
- `fmri`: fMRI file (.nii, .nii.gz)

**Response**:
```json
{
  "prediction": {
    "seizure_probability": 0.88,
    "seizure_type": "Focal Seizure",
    "metadata": {
      "eeg": {...},
      "mri": {...},
      "fmri": {...}
    }
  }
}
```

### GET `/health`
Health check endpoint.

### GET `/`
API information and available endpoints.

### GET `/docs`
Interactive API documentation (Swagger UI).

## 📊 Supported File Formats

- **EEG**: `.edf`, `.bdf`, `.csv`
- **MRI**: `.nii`, `.nii.gz` (NIfTI format)
- **fMRI**: `.nii`, `.nii.gz` (NIfTI format)

## 🔧 Data Processing

The `MedicalDataProcessor` class handles:
- File format validation
- Data loading from various medical formats
- Basic preprocessing (normalization, filtering)
- Metadata extraction

## 🧪 Model Integration

Replace the dummy model in `model.py` with your trained 3D CNN:

```python
def predict_seizure(eeg_array, mri_array, fmri_array):
    # Load your trained model
    model = load_trained_model()
    
    # Prepare input data
    input_data = prepare_multimodal_input(eeg_array, mri_array, fmri_array)
    
    # Make prediction
    prediction = model.predict(input_data)
    
    return {
        "seizure_probability": float(prediction[0]),
        "seizure_type": classify_seizure_type(prediction)
    }
```

## 🐳 Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM python:3.9-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 🔒 Security Notes

- Add authentication for production use
- Implement rate limiting
- Validate file sizes and types
- Use HTTPS in production
- Restrict CORS origins

## 📝 Development

For development with auto-reload:
```bash
uvicorn app:app --reload --host 127.0.0.1 --port 8000
```

## 🧪 Testing

Test the API with curl:
```bash
curl -X POST "http://localhost:8000/predict" \
  -F "eeg=@sample.edf" \
  -F "mri=@sample.nii" \
  -F "fmri=@sample.nii"
```