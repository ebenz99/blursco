#!/usr/bin/env python3
"""
S3 upload utility for blursco

This script:
1. Clears the site_photos folder in S3
2. Uploads all processed images from to_upload folder
3. Uploads thumbnails to placeholders folder
4. Uploads manifest.json
"""

import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import os
import argparse
import sys
from pathlib import Path


def clear_s3_folder(s3_client, bucket_name, folder_path):
    """Clear all objects in an S3 folder"""
    try:
        # List all objects in the folder
        response = s3_client.list_objects_v2(
            Bucket=bucket_name,
            Prefix=folder_path
        )
        
        if 'Contents' in response:
            # Delete all objects
            objects_to_delete = [{'Key': obj['Key']} for obj in response['Contents']]
            
            if objects_to_delete:
                s3_client.delete_objects(
                    Bucket=bucket_name,
                    Delete={'Objects': objects_to_delete}
                )
                print(f"Cleared {len(objects_to_delete)} files from s3://{bucket_name}/{folder_path}")
            else:
                print(f"No files found in s3://{bucket_name}/{folder_path}")
        else:
            print(f"Folder s3://{bucket_name}/{folder_path} is already empty")
            
    except ClientError as e:
        print(f"Error clearing S3 folder: {e}")
        return False
    
    return True


def upload_file_to_s3(s3_client, local_file, bucket_name, s3_key):
    """Upload a single file to S3"""
    try:
        s3_client.upload_file(
            local_file, 
            bucket_name, 
            s3_key,
            ExtraArgs={'ContentType': 'image/jpeg' if s3_key.endswith('.jpg') else 'application/json'}
        )
        return True
    except FileNotFoundError:
        print(f"File {local_file} not found")
        return False
    except NoCredentialsError:
        print("AWS credentials not found")
        return False
    except Exception as e:
        print(f"Error uploading {local_file}: {e}")
        return False


def upload_images_to_s3(bucket_name, to_upload_folder='to_upload', thumbnails_folder='thumbnails'):
    """
    Upload processed images to S3
    
    Args:
        bucket_name: Name of the S3 bucket
        to_upload_folder: Local folder containing processed images
        thumbnails_folder: Local folder containing thumbnails
    """
    
    # Initialize S3 client
    try:
        s3_client = boto3.client('s3')
        # Test connection
        s3_client.head_bucket(Bucket=bucket_name)
    except NoCredentialsError:
        print("Error: AWS credentials not found. Please configure AWS CLI or set environment variables.")
        return False
    except ClientError as e:
        print(f"Error accessing bucket {bucket_name}: {e}")
        return False
    
    # Check if local folders exist
    if not os.path.exists(to_upload_folder):
        print(f"Error: {to_upload_folder} folder not found")
        return False
    
    if not os.path.exists(thumbnails_folder):
        print(f"Error: {thumbnails_folder} folder not found")
        return False
    
    print(f"Starting upload to s3://{bucket_name}")
    
    # Clear existing site_photos folder
    print("Clearing existing site_photos folder...")
    if not clear_s3_folder(s3_client, bucket_name, 'site_photos/'):
        return False
    
    # Clear existing placeholders folder
    print("Clearing existing placeholders folder...")
    if not clear_s3_folder(s3_client, bucket_name, 'placeholders/'):
        return False
    
    # Upload full-size images to site_photos/
    print("Uploading full-size images...")
    uploaded_count = 0
    for filename in os.listdir(to_upload_folder):
        if filename.lower().endswith(('.jpg', '.jpeg', '.json')):
            local_path = os.path.join(to_upload_folder, filename)
            s3_key = f"site_photos/{filename}"
            
            if upload_file_to_s3(s3_client, local_path, bucket_name, s3_key):
                print(f"  Uploaded: {filename}")
                uploaded_count += 1
            else:
                print(f"  Failed: {filename}")
    
    print(f"Uploaded {uploaded_count} full-size images")
    
    # Upload thumbnails to placeholders/
    print("Uploading thumbnails...")
    thumbnail_count = 0
    for filename in os.listdir(thumbnails_folder):
        if filename.lower().endswith(('.jpg', '.jpeg')):
            local_path = os.path.join(thumbnails_folder, filename)
            s3_key = f"placeholders/{filename}"
            
            if upload_file_to_s3(s3_client, local_path, bucket_name, s3_key):
                print(f"  Uploaded: {filename}")
                thumbnail_count += 1
            else:
                print(f"  Failed: {filename}")
    
    print(f"Uploaded {thumbnail_count} thumbnails")
    
    # Upload manifest.json to root for the app to access
    manifest_path = os.path.join(to_upload_folder, 'manifest.json')
    if os.path.exists(manifest_path):
        if upload_file_to_s3(s3_client, manifest_path, bucket_name, 'manifest.json'):
            print("Uploaded manifest.json to bucket root")
        else:
            print("Failed to upload manifest.json")
    
    print(f"\nUpload complete!")
    print(f"- {uploaded_count} full-size images in site_photos/")
    print(f"- {thumbnail_count} thumbnails in placeholders/")
    print(f"- manifest.json in bucket root")
    
    return True


def main():
    parser = argparse.ArgumentParser(description='Upload processed images to S3')
    parser.add_argument('bucket', help='S3 bucket name')
    parser.add_argument('--to-upload', default='to_upload', help='Local folder with processed images')
    parser.add_argument('--thumbnails', default='thumbnails', help='Local folder with thumbnails')
    
    args = parser.parse_args()
    
    success = upload_images_to_s3(args.bucket, args.to_upload, args.thumbnails)
    
    if not success:
        sys.exit(1)


if __name__ == '__main__':
    main()