# Blursco

VSCO clone number three from yours truly. This time with Medium-style lazy loading.

## Stack

ReactJS with AWS S3 "backend". Small placeholder images are blurred until site fetches full-size images from S3.

## Adding New Images

To add a batch of new images to your site:

### 1. Process Images Locally

```bash
# Navigate to utils directory
cd utils

# Install dependencies (first time only)
pip install -r requirements.txt

# Add your images to the source_images folder
# The script will create utils/source_images/ if it doesn't exist

# Process your images (this clears previous processed images)
python process_images.py
```

**Folder Structure:**
- **Input**: `utils/source_images/` - Put your raw images here (any format)
- **Output**: `utils/to_upload/` - Processed full-size JPEGs ready for S3
- **Output**: `utils/thumbnails/` - Small thumbnails for placeholder blur effect

This will:
- Convert all images to JPEG format
- Create optimized full-size versions (max 1920px width) in `to_upload/` folder
- Generate small thumbnails (max 80px width) in `thumbnails/` folder for artistic blur effect
- Use simple sequential naming (0.jpg, 1.jpg, 2.jpg...)
- Create a `manifest.json` with image metadata
- Clear previous processed images each time you run it

### 2. Upload to S3

```bash
# Upload to your S3 bucket (requires AWS CLI configured)
python upload_to_s3.py your-bucket-name
```

This will:
- Clear the existing `site_photos/` folder in S3
- Upload full-size images to `site_photos/` folder
- Clear and upload thumbnails to `placeholders/` folder
- Upload `manifest.json` to bucket root for the app to load

### 3. Update Your Site

Copy the `manifest.json` from the `to_upload/` folder to your `public/` folder, or the app will try to fetch it from your S3 bucket root.

### AWS Setup

Make sure you have AWS credentials configured:
```bash
# Install AWS CLI and configure
aws configure
```

Or set environment variables:
```bash
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_DEFAULT_REGION=us-east-1
```
