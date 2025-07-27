import os
import numpy as np
import nibabel as nib
import scipy.ndimage

# --- User config ---
source_mri_folder = r"C:\Users\Mubarak\OneDrive\Pictures\mri"
source_fmri_folder = r"C:\Users\Mubarak\OneDrive\Pictures\fmri"
out_mri_folder = r"C:\Users\Mubarak\OneDrive\Pictures\mri_resized"
out_fmri_folder = r"C:\Users\Mubarak\OneDrive\Pictures\fmri_resized"

# Target shapes
TARGET_MRI_SHAPE = (128, 128, 64)         # (X,Y,Z)
TARGET_FMRI_SHAPE = (128, 128, 64, 100)   # (X,Y,Z,T)

os.makedirs(out_mri_folder, exist_ok=True)
os.makedirs(out_fmri_folder, exist_ok=True)

# --- MRI ---
for file in os.listdir(source_mri_folder):
    if file.endswith('.nii') or file.endswith('.nii.gz'):
        in_path = os.path.join(source_mri_folder, file)
        out_path = os.path.join(out_mri_folder, file)
        print(f"Processing MRI: {file}")
        img = nib.load(in_path)
        data = img.get_fdata()
        if data.shape != TARGET_MRI_SHAPE:
            print(f"  Resizing {data.shape} → {TARGET_MRI_SHAPE}")
            factors = [t / s for t, s in zip(TARGET_MRI_SHAPE, data.shape)]
            data = scipy.ndimage.zoom(data, factors, order=1)
        new_img = nib.Nifti1Image(data, affine=img.affine)
        nib.save(new_img, out_path)
        print(f"  Saved: {out_path}")

# --- fMRI ---
for file in os.listdir(source_fmri_folder):
    if file.endswith('.nii') or file.endswith('.nii.gz'):
        in_path = os.path.join(source_fmri_folder, file)
        out_path = os.path.join(out_fmri_folder, file)
        print(f"Processing fMRI: {file}")
        img = nib.load(in_path)
        data = img.get_fdata()
        if data.shape != TARGET_FMRI_SHAPE:
            print(f"  Resizing {data.shape} → {TARGET_FMRI_SHAPE}")
            factors = [t / s for t, s in zip(TARGET_FMRI_SHAPE, data.shape)]
            data = scipy.ndimage.zoom(data, factors, order=1)
        new_img = nib.Nifti1Image(data, affine=img.affine)
        nib.save(new_img, out_path)
        print(f"  Saved: {out_path}")

print("✅ All volumes resized and saved!")
