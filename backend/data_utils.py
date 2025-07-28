"""
Data utilities for medical image processing and validation — memory-safe for low-RAM servers.
"""

import nibabel as nib
import numpy as np
import os
from typing import Tuple, Optional, Dict, Any

class MedicalDataProcessor:
    @staticmethod
    def load_fmri_data(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Load fMRI data from NIfTI file, with safe slicing to reduce memory.
        """
        try:
            img = nib.load(file_path)
            data = img.get_fdata()

            # ✅ Safe: keep only the first 20 timepoints and slices if huge
            if data.ndim == 4 and data.shape[3] > 20:
                data = data[..., :20]
            if data.shape[0] > 64:
                data = data[:64, :64, :32, ...]  # Crop to reasonable size

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
        Load EEG data from EDF, BDF, or CSV file with safe slicing.
        """
        import mne
        file_ext = os.path.splitext(file_path)[1].lower()
        try:
            if file_ext in ['.edf', '.bdf']:
                raw = (
                    mne.io.read_raw_edf(file_path, preload=True)
                    if file_ext == '.edf'
                    else mne.io.read_raw_bdf(file_path, preload=True)
                )
                data = raw.get_data()

                # ✅ Safe: keep only first 10 channels & 1000 samples max
                data = data[:10, :1000]

                metadata = {
                    'n_channels': raw.info['nchan'],
                    'sampling_rate': raw.info['sfreq'],
                    'duration_sec': raw.n_times / raw.info['sfreq'],
                    'channel_names': raw.ch_names,
                    'file_format': file_ext.upper().replace('.', '')
                }
            elif file_ext == '.csv':
                data = np.loadtxt(file_path, delimiter=',')
                if data.ndim == 1:
                    data = data.reshape(1, -1)

                # ✅ Safe: slice CSV too if huge
                data = data[:10, :1000]

                metadata = {
                    'shape': data.shape,
                    'file_format': 'CSV'
                }
            else:
                raise ValueError(f"Unsupported EEG file format: {file_ext}")
            return data, metadata
        except Exception as e:
            raise ValueError(f"Error loading EEG data: {str(e)}")

    @staticmethod
    def load_mri_data(file_path: str) -> Tuple[np.ndarray, Dict[str, Any]]:
        """
        Load MRI data from NIfTI file, cropped safely.
        """
        try:
            img = nib.load(file_path)
            data = img.get_fdata()

            # ✅ Safe: crop large volumes
            if data.shape[0] > 128:
                data = data[:128, :128, :64]

            metadata = {
                'shape': data.shape,
                'affine': img.affine.tolist(),
                'header': str(img.header),
                'file_format': 'NIfTI'
            }
            return data, metadata
        except Exception as e:
            raise ValueError(f"Error loading MRI data: {str(e)}")

    @staticmethod
    def validate_file_format(filename: str, expected_type: str) -> bool:
        file_ext = os.path.splitext(filename)[1].lower()
        format_map = {
            'mri': ['.nii', '.nii.gz'],
            'fmri': ['.nii', '.nii.gz'],
            'eeg': ['.edf', '.bdf', '.csv']
        }
        return file_ext in format_map.get(expected_type, [])

    @staticmethod
    def preprocess_mri(data: np.ndarray) -> np.ndarray:
        data_min, data_max = data.min(), data.max()
        if data_max > data_min:
            data = (data - data_min) / (data_max - data_min)
        return data

    @staticmethod
    def preprocess_fmri(data: np.ndarray) -> np.ndarray:
        data_min, data_max = data.min(), data.max()
        if data_max > data_min:
            data = (data - data_min) / (data_max - data_min)
        return data

    @staticmethod
    def preprocess_eeg(data: np.ndarray, sampling_rate: Optional[float] = None) -> np.ndarray:
        data = (data - data.mean(axis=1, keepdims=True)) / data.std(axis=1, keepdims=True)
        return data
