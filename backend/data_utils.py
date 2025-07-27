"""
Data utilities for medical image processing and validation
"""
import nibabel as nib
import numpy as np
import os
from typing import Tuple, Optional, Dict, Any

class MedicalDataProcessor:
    @staticmethod
    def load_fmri_data(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Load fMRI data from NIfTI file
        Args:
            file_path (str): Path to fMRI file
        Returns:
            Tuple[np.ndarray, Dict]: fMRI data array and metadata
        """
        try:
            img = nib.load(file_path)
            data = img.get_fdata()
            metadata = {
                'shape': data.shape,
                'affine': img.affine.tolist(),
                'header': str(img.header),
                'file_format': 'NIfTI'
            }
            return data, metadata
        except Exception as e:
            raise ValueError(f"Error loading fMRI data: {str(e)}")
    @staticmethod
    def load_eeg_data(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Load EEG data from EDF, BDF, or CSV file
        Args:
            file_path (str): Path to EEG file
        Returns:
            Tuple[np.ndarray, Dict]: EEG data array and metadata
        """
        import mne
        file_ext = os.path.splitext(file_path)[1].lower()
        try:
            if file_ext in ['.edf', '.bdf']:
                raw = mne.io.read_raw_edf(file_path, preload=True) if file_ext == '.edf' else mne.io.read_raw_bdf(file_path, preload=True)
                data = raw.get_data()
                metadata = {
                    'n_channels': raw.info['nchan'],
                    'sampling_rate': raw.info['sfreq'],
                    'duration_sec': raw.n_times / raw.info['sfreq'],
                    'channel_names': raw.ch_names,
                    'file_format': file_ext.upper().replace('.', '')
                }
            elif file_ext == '.csv':
                data = np.loadtxt(file_path, delimiter=',')
                metadata = {
                    'shape': data.shape,
                    'file_format': 'CSV'
                }
            else:
                raise ValueError(f"Unsupported EEG file format: {file_ext}")
            return data, metadata
        except Exception as e:
            raise ValueError(f"Error loading EEG data: {str(e)}")
    """
    Utility class for processing medical imaging and EEG data
    """
    
    @staticmethod
    def load_mri_data(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Load MRI data from NIfTI file
        
        Args:
            file_path (str): Path to MRI file
            
        Returns:
            Tuple[np.ndarray, Dict]: MRI data array and metadata
        """
        try:
            img = nib.load(file_path)
            data = img.get_fdata()
            metadata = {
                'shape': data.shape,
                'affine': img.affine.tolist(),
                'header': str(img.header),
                'file_format': 'NIfTI'
            }
            return data, metadata
        except Exception as e:
            raise ValueError(f"Error loading MRI data: {str(e)}")
    
    # All conversion functions removed as .nii files are now directly used
    
    @staticmethod
    def validate_file_format(filename: str, expected_type: str) -> bool:
        """
        Validate if file format matches expected medical data type
        
        Args:
            filename (str): Name of the file
            expected_type (str): Expected data type ('mri', 'fmri', 'eeg')
            
        Returns:
            bool: True if format is valid
        """
        file_ext = os.path.splitext(filename)[1].lower()
        
        format_map = {
            'mri': ['.nii', '.nii.gz'],
            'fmri': ['.nii', '.nii.gz'],
            'eeg': ['.edf', '.bdf', '.csv']
        }
        
        return file_ext in format_map.get(expected_type, [])
    
    @staticmethod
    def preprocess_mri(data: np.ndarray) -> np.ndarray:
        """
        Basic MRI preprocessing (normalization, resizing if needed)
        
        Args:
            data (np.ndarray): Raw MRI data
            
        Returns:
            np.ndarray: Preprocessed MRI data
        """
        # Normalize to 0-1 range
        data_min, data_max = data.min(), data.max()
        if data_max > data_min:
            data = (data - data_min) / (data_max - data_min)
        
        return data
    
    @staticmethod
    def preprocess_fmri(data: np.ndarray) -> np.ndarray:
        """
        Basic fMRI preprocessing
        
        Args:
            data (np.ndarray): Raw fMRI data
            
        Returns:
            np.ndarray: Preprocessed fMRI data
        """
        # Normalize to 0-1 range
        data_min, data_max = data.min(), data.max()
        if data_max > data_min:
            data = (data - data_min) / (data_max - data_min)
        
        return data
    
    @staticmethod
    def preprocess_eeg(data: np.ndarray, sampling_rate: Optional[float] = None) -> np.ndarray:
        """
        Basic EEG preprocessing
        
        Args:
            data (np.ndarray): Raw EEG data
            sampling_rate (float, optional): Sampling rate for filtering
            
        Returns:
            np.ndarray: Preprocessed EEG data
        """
        # Basic normalization
        data = (data - data.mean(axis=1, keepdims=True)) / data.std(axis=1, keepdims=True)
        
        return data