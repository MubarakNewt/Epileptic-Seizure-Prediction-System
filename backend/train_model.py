import os
import numpy as np
import tensorflow as tf
import nibabel as nib
import mne
import scipy.ndimage

# --- 1️⃣ Folders ---
eeg_folder = r"C:\Users\Mubarak\Downloads\egg"
mri_folder = r"C:\Users\Mubarak\OneDrive\Pictures\mri"
fmri_folder = r"C:\Users\Mubarak\OneDrive\Pictures\fmri"

# --- 2️⃣ Target shapes ---
target_eeg_shape = (23, 1000)
target_mri_shape = (64, 64, 32)
target_fmri_shape = (64, 64, 32, 10)

# --- 3️⃣ Find subjects ---
subject_ids = set()
for file in os.listdir(eeg_folder):
    if file.endswith('.edf') or file.endswith('.csv'):
        subj = file.split('_')[0]  # sub-1
        subject_ids.add(subj)

print(f"✅ Found subject IDs: {subject_ids}")

# --- 4️⃣ Load and pair ---
X_eeg, X_mri, X_fmri, y = [], [], [], []

for subj in sorted(subject_ids):
    eeg_file = os.path.join(eeg_folder, f"{subj}_eeg.edf")
    mri_file = os.path.join(mri_folder, f"{subj}_T1w.nii.gz")
    fmri_file = os.path.join(fmri_folder, f"{subj}_task-rest_bold.nii.gz")

    # ✅ EEG
    if os.path.exists(eeg_file):
        raw = mne.io.read_raw_edf(eeg_file, preload=True)
        eeg_array = raw.get_data()

        # Always trim channels if needed
        eeg_array = eeg_array[:target_eeg_shape[0], :]

        # Fix time axis
        if eeg_array.shape[1] >= target_eeg_shape[1]:
            eeg_array = eeg_array[:, :target_eeg_shape[1]]
        else:
            pad_width = target_eeg_shape[1] - eeg_array.shape[1]
            eeg_array = np.pad(eeg_array, ((0, 0), (0, pad_width)), mode='constant')

        print(f"✅ EEG shape for {subj}: {eeg_array.shape}")
    else:
        print(f"❌ Missing EEG for {subj}")
        continue

    # ✅ MRI
    if os.path.exists(mri_file):
        mri_array = nib.load(mri_file).get_fdata()
        if mri_array.shape != target_mri_shape:
            print(f"⚙️ Resizing MRI for {subj}: {mri_array.shape} → {target_mri_shape}")
            factors = [t / s for t, s in zip(target_mri_shape, mri_array.shape)]
            mri_array = scipy.ndimage.zoom(mri_array, factors, order=1)
    else:
        print(f"❌ Missing MRI for {subj}")
        continue

    # ✅ fMRI
    if os.path.exists(fmri_file):
        fmri_array = nib.load(fmri_file).get_fdata()
        if fmri_array.shape != target_fmri_shape:
            print(f"⚙️ Resizing fMRI for {subj}: {fmri_array.shape} → {target_fmri_shape}")
            factors = [t / s for t, s in zip(target_fmri_shape, fmri_array.shape)]
            fmri_array = scipy.ndimage.zoom(fmri_array, factors, order=1)
    else:
        print(f"❌ Missing fMRI for {subj}")
        continue

    X_eeg.append(eeg_array)
    X_mri.append(mri_array)
    X_fmri.append(fmri_array)
    y.append(1)  # Dummy label

print(f"✅ Loaded {len(X_eeg)} complete samples")

# --- 5️⃣ Stack ---
X_eeg = np.array(X_eeg)
X_mri = np.array(X_mri)
X_fmri = np.array(X_fmri)
y = np.array(y)

print("Shapes:", X_eeg.shape, X_mri.shape, X_fmri.shape, y.shape)

# --- 6️⃣ Model ---
from tensorflow.keras.layers import Conv3D, GlobalAveragePooling3D, Reshape, Flatten, Dense, Concatenate

input_mri = tf.keras.Input(shape=target_mri_shape, name='mri')
x_mri = Reshape((*target_mri_shape, 1))(input_mri)
x_mri = Conv3D(8, 3, activation='relu')(x_mri)
x_mri = GlobalAveragePooling3D()(x_mri)

input_fmri = tf.keras.Input(shape=target_fmri_shape, name='fmri')
x_fmri = Conv3D(8, 3, activation='relu')(input_fmri)
x_fmri = GlobalAveragePooling3D()(x_fmri)

input_eeg = tf.keras.Input(shape=target_eeg_shape, name='eeg')
x_eeg = Flatten()(input_eeg)
x_eeg = Dense(64, activation='relu')(x_eeg)

x = Concatenate()([x_mri, x_fmri, x_eeg])
x = Dense(64, activation='relu')(x)
output = Dense(1, activation='sigmoid')(x)

model = tf.keras.Model(inputs=[input_eeg, input_mri, input_fmri], outputs=output)
model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])

# --- 7️⃣ Train ---
model.fit([X_eeg, X_mri, X_fmri], y, epochs=1, batch_size=1)

model.save('model.h5')
print('✅ Model saved as model.h5')
