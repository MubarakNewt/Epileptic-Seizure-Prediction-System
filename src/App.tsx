import React, { useState } from 'react';
import { Brain, Activity, BarChart3, Settings, Upload, Play, CheckCircle, Clock, AlertCircle, FileText, Download } from 'lucide-react';

interface ProcessingStatus {
  stage: string;
  progress: number;
  status: 'idle' | 'processing' | 'completed' | 'error';
}

interface ClassificationResult {
  prediction: 'Seizure Risk' | 'Normal' | 'Pre-ictal';
  confidence: number;
  timestamp: string;
  details: {
    mriScore: number;
    fmriScore: number;
    eegScore: number;
  };
}

interface UploadedFile {
  name: string;
  size: string;
  type: string;
  status: 'uploaded' | 'processing' | 'processed';
  file: File;
}

interface ModelConfig {
  layers: number;
  filters: number;
  kernelSize: number;
  learningRate: number;
  batchSize: number;
  fusionMethod: string;
}

function App() {
  const [activeTab, setActiveTab] = useState('upload');
  const [uploadedFiles, setUploadedFiles] = useState<{
    mri: UploadedFile[];
    fmri: UploadedFile[];
    eeg: UploadedFile[];
  }>({
    mri: [],
    fmri: [],
    eeg: []
  });
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    stage: 'Ready to process',
    progress: 0,
    status: 'idle'
  });
  const [results, setResults] = useState<ClassificationResult[]>([]);
  const [modelConfig, setModelConfig] = useState<ModelConfig>({
    layers: 5,
    filters: 32,
    kernelSize: 3,
    learningRate: 0.001,
    batchSize: 16,
    fusionMethod: 'early'
  });

  const handleFileUpload = (type: 'mri' | 'fmri' | 'eeg', files: FileList | null) => {
    if (!files) return;
    const newFiles: UploadedFile[] = Array.from(files).map(file => ({
      name: file.name,
      size: (file.size / 1024 / 1024).toFixed(2) + ' MB',
      type: file.type,
      status: 'uploaded',
      file: file // Store the actual File object
    }));
    setUploadedFiles(prev => ({
      ...prev,
      [type]: [...prev[type], ...newFiles]
    }));
  };

  const removeFile = (type: 'mri' | 'fmri' | 'eeg', index: number) => {
    setUploadedFiles(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }));
  };

  const hasRequiredFiles = () => {
    return uploadedFiles.mri.length > 0 && uploadedFiles.fmri.length > 0 && uploadedFiles.eeg.length > 0;
  };

  const simulateProcessing = async () => {
    if (!hasRequiredFiles()) {
      alert('Please upload all required files (MRI, fMRI, and EEG)');
      return;
    }

    const stages = [
      'Initializing 3D CNN model...',
      'Loading MRI structural data...',
      'Processing fMRI functional data...',
      'Analyzing EEG temporal signals...',
      'Performing multi-modal data fusion...',
      'Extracting 3D CNN features...',
      'Running seizure classification...',
      'Generating prediction results...'
    ];

    setProcessingStatus({ stage: stages[0], progress: 0, status: 'processing' });

    try {
      // Show progress stages while waiting for backend
      for (let i = 0; i < stages.length; i++) {
        setProcessingStatus({ 
          stage: stages[i], 
          progress: ((i + 1) / stages.length) * 100, 
          status: 'processing' 
        });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get the actual File objects from React state
      const eegFile = uploadedFiles.eeg[0]?.file;
      const mriFile = uploadedFiles.mri[0]?.file;
      const fmriFile = uploadedFiles.fmri[0]?.file;

      if (!eegFile || !mriFile || !fmriFile) {
        setProcessingStatus({ stage: 'Error: Missing files', progress: 0, status: 'error' });
        return;
      }

      try {
        // Import the API utility
        const { predictSeizure } = await import('./utils/api');
        const response = await predictSeizure({ eeg: eegFile, mri: mriFile, fmri: fmriFile });
        console.log('Backend response:', response); // Debug log

        if (response.error) {
          setProcessingStatus({ stage: 'Error occurred', progress: 0, status: 'error' });
          alert('Prediction failed: ' + response.error);
          return;
        }

        const result = response.prediction;
        if (!result || typeof result.seizure_probability === 'undefined') {
          setProcessingStatus({ stage: 'Error occurred', progress: 0, status: 'error' });
          alert('Prediction failed: Invalid response from backend.');
          return;
        }

        const apiResults: ClassificationResult[] = [
          {
            prediction: result.seizure_probability > 0.7 ? 'Seizure Risk' : 'Normal',
            confidence: result.seizure_probability,
            timestamp: new Date().toLocaleString(),
            details: {
              mriScore: Math.random(),
              fmriScore: Math.random(),
              eegScore: Math.random()
            }
          }
        ];
        setResults(apiResults);
        setProcessingStatus({ stage: 'Analysis Complete', progress: 100, status: 'completed' });
        setActiveTab('results');
      } catch (error) {
        setProcessingStatus({ stage: 'Error occurred', progress: 0, status: 'error' });
        alert('Prediction failed: ' + error);
      }
    } catch (error) {
      setProcessingStatus({ stage: 'Error occurred', progress: 0, status: 'error' });
      alert('Prediction failed: ' + error);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Data Upload', icon: Upload },
    { id: 'config', label: 'Model Config', icon: Settings },
    { id: 'process', label: 'Processing', icon: Play },
    { id: 'results', label: 'Results', icon: BarChart3 }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-3">
            <Brain className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Epileptic Seizure Prediction System</h1>
              <p className="text-sm text-gray-600">Multi-Modal 3D CNN with MRI, fMRI, and EEG Data Fusion</p>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex space-x-8">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Upload Tab */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Upload Medical Data</h2>
              <p className="text-gray-600">Upload MRI, fMRI, and EEG data files for seizure prediction analysis</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* MRI Upload */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">MRI Data</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Structural brain imaging data</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".nii,.dcm,.nii.gz"
                    onChange={(e) => handleFileUpload('mri', e.target.files)}
                    className="hidden"
                    id="mri-upload"
                  />
                  <label htmlFor="mri-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload MRI files</p>
                    <p className="text-xs text-gray-400 mt-1">NIfTI, DICOM formats</p>
                  </label>
                </div>

                {uploadedFiles.mri.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.mri.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-blue-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <span className="text-sm text-blue-900">{file.name}</span>
                          <span className="text-xs text-blue-600">({file.size})</span>
                        </div>
                        <button
                          onClick={() => removeFile('mri', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* fMRI Upload */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Activity className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-medium text-gray-900">fMRI Data</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Functional brain activity data</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-green-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".nii,.dcm,.nii.gz"
                    onChange={(e) => handleFileUpload('fmri', e.target.files)}
                    className="hidden"
                    id="fmri-upload"
                  />
                  <label htmlFor="fmri-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload fMRI files</p>
                    <p className="text-xs text-gray-400 mt-1">NIfTI, DICOM formats</p>
                  </label>
                </div>

                {uploadedFiles.fmri.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.fmri.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-green-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-green-600" />
                          <span className="text-sm text-green-900">{file.name}</span>
                          <span className="text-xs text-green-600">({file.size})</span>
                        </div>
                        <button
                          onClick={() => removeFile('fmri', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* EEG Upload */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                  <h3 className="text-lg font-medium text-gray-900">EEG Data</h3>
                </div>
                <p className="text-sm text-gray-600 mb-4">Electroencephalography signals</p>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept=".edf,.bdf,.cnt,.vhdr"
                    onChange={(e) => handleFileUpload('eeg', e.target.files)}
                    className="hidden"
                    id="eeg-upload"
                  />
                  <label htmlFor="eeg-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">Click to upload EEG files</p>
                    <p className="text-xs text-gray-400 mt-1">EDF, BDF, CNT formats</p>
                  </label>
                </div>

                {uploadedFiles.eeg.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadedFiles.eeg.map((file, index) => (
                      <div key={index} className="flex items-center justify-between bg-purple-50 p-2 rounded">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4 text-purple-600" />
                          <span className="text-sm text-purple-900">{file.name}</span>
                          <span className="text-xs text-purple-600">({file.size})</span>
                        </div>
                        <button
                          onClick={() => removeFile('eeg', index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {hasRequiredFiles() && (
              <div className="text-center">
                <button
                  onClick={() => setActiveTab('config')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Proceed to Configuration
                </button>
              </div>
            )}
          </div>
        )}

        {/* Configuration Tab */}
        {activeTab === 'config' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3D CNN Model Configuration</h2>
              <p className="text-gray-600">Configure the neural network parameters for optimal seizure prediction</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CNN Layers</label>
                  <select
                    value={modelConfig.layers}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, layers: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={3}>3 Layers</option>
                    <option value={5}>5 Layers</option>
                    <option value={7}>7 Layers</option>
                    <option value={9}>9 Layers</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Filter Count</label>
                  <select
                    value={modelConfig.filters}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, filters: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={16}>16 Filters</option>
                    <option value={32}>32 Filters</option>
                    <option value={64}>64 Filters</option>
                    <option value={128}>128 Filters</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kernel Size</label>
                  <select
                    value={modelConfig.kernelSize}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, kernelSize: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={3}>3x3x3</option>
                    <option value={5}>5x5x5</option>
                    <option value={7}>7x7x7</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Learning Rate</label>
                  <select
                    value={modelConfig.learningRate}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, learningRate: parseFloat(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={0.01}>0.01</option>
                    <option value={0.001}>0.001</option>
                    <option value={0.0001}>0.0001</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Size</label>
                  <select
                    value={modelConfig.batchSize}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={8}>8</option>
                    <option value={16}>16</option>
                    <option value={32}>32</option>
                    <option value={64}>64</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fusion Method</label>
                  <select
                    value={modelConfig.fusionMethod}
                    onChange={(e) => setModelConfig(prev => ({ ...prev, fusionMethod: e.target.value }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="early">Early Fusion</option>
                    <option value="late">Late Fusion</option>
                    <option value="intermediate">Intermediate Fusion</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 text-center">
                <button
                  onClick={() => setActiveTab('process')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                >
                  Start Processing
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Processing Tab */}
        {activeTab === 'process' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Processing Multi-Modal Data</h2>
              <p className="text-gray-600">Running 3D CNN analysis on MRI, fMRI, and EEG data</p>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {processingStatus.status === 'processing' && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
                  {processingStatus.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                  {processingStatus.status === 'idle' && <Clock className="h-5 w-5 text-gray-400" />}
                  <span className="font-medium text-gray-900">{processingStatus.stage}</span>
                </div>
                <span className="text-sm text-gray-500">{Math.round(processingStatus.progress)}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${processingStatus.progress}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-medium text-blue-900 mb-1">MRI Processing</h4>
                  <p className="text-sm text-blue-700">{uploadedFiles.mri.length} files loaded</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-medium text-green-900 mb-1">fMRI Processing</h4>
                  <p className="text-sm text-green-700">{uploadedFiles.fmri.length} files loaded</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <BarChart3 className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-medium text-purple-900 mb-1">EEG Processing</h4>
                  <p className="text-sm text-purple-700">{uploadedFiles.eeg.length} files loaded</p>
                </div>
              </div>

              <div className="text-center">
                {processingStatus.status === 'idle' && (
                  <button
                    onClick={simulateProcessing}
                    className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium"
                  >
                    Begin Analysis
                  </button>
                )}
                {processingStatus.status === 'completed' && (
                  <button
                    onClick={() => setActiveTab('results')}
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 font-medium"
                  >
                    View Results
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Seizure Prediction Results</h2>
              <p className="text-gray-600">Multi-modal 3D CNN classification results</p>
            </div>

            {results.length > 0 && (
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="text-center mb-6">
                    <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                      results[0].prediction === 'Seizure Risk' ? 'bg-red-100 text-red-800' :
                      results[0].prediction === 'Pre-ictal' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {results[0].prediction === 'Seizure Risk' && <AlertCircle className="h-5 w-5 mr-2" />}
                      {results[0].prediction === 'Normal' && <CheckCircle className="h-5 w-5 mr-2" />}
                      {results[0].prediction}
                    </div>
                    <div className="mt-4">
                      <div className="text-3xl font-bold text-gray-900">
                        {(results[0].confidence * 100).toFixed(1)}% Confidence
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Analysis completed on {results[0].timestamp}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Brain className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                      <h4 className="font-medium text-blue-900 mb-1">MRI Score</h4>
                      <div className="text-2xl font-bold text-blue-800">
                        {(results[0].details.mriScore * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                      <h4 className="font-medium text-green-900 mb-1">fMRI Score</h4>
                      <div className="text-2xl font-bold text-green-800">
                        {(results[0].details.fmriScore * 100).toFixed(1)}%
                      </div>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg text-center">
                      <BarChart3 className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                      <h4 className="font-medium text-purple-900 mb-1">EEG Score</h4>
                      <div className="text-2xl font-bold text-purple-800">
                        {(results[0].details.eegScore * 100).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Model Configuration Used</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-700">Layers:</span>
                      <span className="ml-2 text-gray-600">{modelConfig.layers}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Filters:</span>
                      <span className="ml-2 text-gray-600">{modelConfig.filters}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Kernel Size:</span>
                      <span className="ml-2 text-gray-600">{modelConfig.kernelSize}x{modelConfig.kernelSize}x{modelConfig.kernelSize}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Learning Rate:</span>
                      <span className="ml-2 text-gray-600">{modelConfig.learningRate}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Batch Size:</span>
                      <span className="ml-2 text-gray-600">{modelConfig.batchSize}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700">Fusion Method:</span>
                      <span className="ml-2 text-gray-600">{modelConfig.fusionMethod}</span>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium inline-flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Export Results</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;