import nibabel as nib
import os
import sys
from pathlib import Path

def convert_hdr_img_to_nii(source_dir, output_dir):
    """
    Batch convert all .hdr + .img pairs in OASIS folder to single .nii files.
    
    Args:
        source_dir (str): Path to extracted OASIS folder containing subject folders
        output_dir (str): Output folder for converted .nii files
    """
    
    # Make output folder if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    converted_count = 0
    missing_count = 0
    
    print(f"🔄 Starting conversion from: {source_dir}")
    print(f"📁 Output directory: {output_dir}")
    print("-" * 50)
    
    # Check if source directory exists
    if not os.path.exists(source_dir):
        print(f"❌ Error: Source directory '{source_dir}' does not exist!")
        return
    
    # Loop through each subject folder
    for folder_name in os.listdir(source_dir):
        folder_path = os.path.join(source_dir, folder_name)
        
        if os.path.isdir(folder_path):
            hdr_file = os.path.join(folder_path, "T1.hdr")
            img_file = os.path.join(folder_path, "T1.img")
            
            if os.path.exists(hdr_file) and os.path.exists(img_file):
                try:
                    print(f"🔄 Converting: {folder_name}")
                    
                    # Load Analyze pair (.hdr + .img)
                    analyze_img = nib.load(hdr_file)
                    
                    # Save as NIfTI
                    nii_file = os.path.join(output_dir, f"{folder_name}.nii")
                    nib.save(analyze_img, nii_file)
                    
                    print(f"✅ Saved: {nii_file}")
                    converted_count += 1
                    
                except Exception as e:
                    print(f"❌ Error converting {folder_name}: {str(e)}")
                    
            else:
                print(f"⚠️  Missing files in: {folder_name}")
                if not os.path.exists(hdr_file):
                    print(f"   Missing: T1.hdr")
                if not os.path.exists(img_file):
                    print(f"   Missing: T1.img")
                missing_count += 1
    
    print("-" * 50)
    print(f"✅ Conversion complete!")
    print(f"📊 Successfully converted: {converted_count} files")
    print(f"⚠️  Skipped (missing files): {missing_count} folders")
    print(f"📁 Output location: {os.path.abspath(output_dir)}")

def main():
    """
    Main function to run the converter with configurable paths
    """
    
    # -------------------------------------
    # ✅ CONFIG: set your extracted folder
    # -------------------------------------
    # Example: "C:/Users/YourName/OASIS/" or "./oasis_cross-sectional_disc1/"
    source_dir = "./oasis_cross-sectional_disc1"  # update to your actual path
    output_dir = "./converted_nii"  # output folder for .nii files
    
    # Allow command line arguments to override defaults
    if len(sys.argv) >= 2:
        source_dir = sys.argv[1]
    if len(sys.argv) >= 3:
        output_dir = sys.argv[2]
    
    print("🧠 OASIS HDR/IMG to NII Batch Converter")
    print("=" * 50)
    
    # Run the conversion
    convert_hdr_img_to_nii(source_dir, output_dir)

if __name__ == "__main__":
    main()