#!/usr/bin/env python3
"""
Image processing utility for blursco

This script:
1. Converts all images in a source folder to JPEG format
2. Creates small thumbnails for blurry loading effect
3. Generates a manifest with image metadata
4. Uses simple sequential numbering
"""

import os
import sys
from PIL import Image
import json
from datetime import datetime
import argparse
import shutil


def process_images(source_folder, output_folder, thumbnail_folder, max_width=1920, thumbnail_max_width=80):
    """
    Process images: convert to JPEG and create thumbnails
    
    Args:
        source_folder: Path to folder containing original images
        output_folder: Path to save processed full-size images (to_upload)
        thumbnail_folder: Path to save thumbnail images
        max_width: Maximum width for full-size images
        thumbnail_max_width: Maximum width for thumbnails
    """
    
    # Clear and create output directories
    if os.path.exists(output_folder):
        shutil.rmtree(output_folder)
    if os.path.exists(thumbnail_folder):
        shutil.rmtree(thumbnail_folder)
    
    os.makedirs(output_folder, exist_ok=True)
    os.makedirs(thumbnail_folder, exist_ok=True)
    
    # Supported image extensions
    supported_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    
    manifest = {
        'processed_at': datetime.now().isoformat(),
        'images': []
    }
    
    image_files = []
    
    # Collect all image files
    for filename in os.listdir(source_folder):
        file_ext = os.path.splitext(filename)[1].lower()
        if file_ext in supported_extensions:
            image_files.append(filename)
    
    # Sort files for consistent processing
    image_files.sort()
    
    print(f"Found {len(image_files)} images to process")
    
    for idx, filename in enumerate(image_files):
        try:
            source_path = os.path.join(source_folder, filename)
            
            # Generate simple sequential filename
            new_filename = f"{idx}.jpg"
            
            # Process full-size image
            with Image.open(source_path) as img:
                # Convert to RGB if necessary (handles PNG with transparency)
                if img.mode in ('RGBA', 'LA', 'P'):
                    img = img.convert('RGB')
                
                # Resize if too large
                if img.width > max_width:
                    ratio = max_width / img.width
                    new_height = int(img.height * ratio)
                    img = img.resize((max_width, new_height), Image.Resampling.LANCZOS)
                
                # Save full-size image to to_upload folder
                full_output_path = os.path.join(output_folder, new_filename)
                img.save(full_output_path, 'JPEG', quality=85, optimize=True)
                
                # Create small thumbnail for blurry effect
                thumb_img = img.copy()
                if thumb_img.width > thumbnail_max_width:
                    ratio = thumbnail_max_width / thumb_img.width
                    new_thumb_height = int(thumb_img.height * ratio)
                    thumb_img = thumb_img.resize((thumbnail_max_width, new_thumb_height), Image.Resampling.LANCZOS)
                
                thumbnail_path = os.path.join(thumbnail_folder, new_filename)
                thumb_img.save(thumbnail_path, 'JPEG', quality=60, optimize=True)
                
                # Add to manifest
                manifest['images'].append({
                    'original_filename': filename,
                    'processed_filename': new_filename,
                    'index': idx,
                    'dimensions': {
                        'width': img.width,
                        'height': img.height
                    }
                })
                
                print(f"Processed: {filename} -> {new_filename}")
                
        except Exception as e:
            print(f"Error processing {filename}: {str(e)}")
            continue
    
    # Save manifest to both folders
    manifest_path = os.path.join(output_folder, 'manifest.json')
    with open(manifest_path, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    manifest_path_thumb = os.path.join(thumbnail_folder, 'manifest.json')
    with open(manifest_path_thumb, 'w') as f:
        json.dump(manifest, f, indent=2)
    
    print(f"\nProcessing complete!")
    print(f"Processed {len(manifest['images'])} images")
    print(f"Full-size images saved to: {output_folder}")
    print(f"Thumbnails saved to: {thumbnail_folder}")
    print(f"Manifest saved to both folders")
    
    return manifest


def main():
    parser = argparse.ArgumentParser(description='Process images for blursco')
    parser.add_argument('source', help='Source folder containing images')
    parser.add_argument('--output', default='to_upload', help='Output folder for full-size images')
    parser.add_argument('--thumbnails', default='thumbnails', help='Output folder for thumbnails')
    parser.add_argument('--max-width', type=int, default=1920, help='Maximum width for full-size images')
    parser.add_argument('--thumb-max-width', type=int, default=80, help='Maximum width for thumbnails')
    
    args = parser.parse_args()
    
    if not os.path.exists(args.source):
        print(f"Error: Source folder '{args.source}' does not exist")
        sys.exit(1)
    
    process_images(
        args.source,
        args.output,
        args.thumbnails,
        args.max_width,
        args.thumb_max_width
    )


if __name__ == '__main__':
    main()