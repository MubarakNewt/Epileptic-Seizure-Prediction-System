# Epileptic Seizure Prediction System

A multi-modal 3D CNN system for epileptic seizure prediction using MRI, fMRI, and EEG data fusion.

## 🏗️ Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: FastAPI + Python
- **ML Pipeline**: Multi-modal 3D CNN with data fusion

## 🚀 Quick Start

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the FastAPI server:
```bash
python start.py
```

The backend will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

### Frontend Setup

1. Install Node.js dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📁 Project Structure

```
├── backend/
│   ├── app.py              # FastAPI main application
│   ├── model.py            # ML model and prediction logic
│   ├── requirements.txt    # Python dependencies
│   └── start.py           # Server startup script
├── src/
│   ├── App.tsx            # Main React application
│   ├── utils/
│   │   └── api.ts         # API communication utilities
│   └── ...
└── README.md
```

## 🔧 API Endpoints

### POST `/predict`
Upload medical data files for seizure prediction.

**Request**: Multipart form data with:
- `eeg`: EEG file (.edf, .csv)
- `mri`: MRI file (.nii, .nii.gz)
- `fmri`: fMRI file (.nii, .nii.gz)

**Response**:
```json
{
  "prediction": {
    "seizure_probability": 0.88,
    "seizure_type": "Focal Seizure"
  }
}
```

## 📊 Supported File Formats

- **EEG**: .edf, .csv
- **MRI**: .nii, .nii.gz (NIfTI format)
- **fMRI**: .nii, .nii.gz (NIfTI format)

## 🧠 Model Information

The current implementation includes a dummy model for demonstration. Replace the `predict_seizure` function in `backend/model.py` with your trained 3D CNN model.

## 🔄 Development Workflow

1. Upload medical data files through the web interface
2. Configure model parameters
3. Process data through the multi-modal pipeline
4. View prediction results and confidence scores

## 📝 Next Steps

- Replace dummy model with trained 3D CNN
- Add data preprocessing and validation
- Implement model performance metrics
- Add user authentication and data security
- Deploy to production environment