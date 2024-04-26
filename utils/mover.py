# make sure to put images in imgs folder in utils dir
# then create empty placeholders and photos dir in utils dir
# make sure all jpegs
# this will re-number all of them, generate placeholders, and put re-numbered images in photos to upload to s3
# will print filenames that were unusable
# rotate items that were accidentally rotated
# add number of photos to second jpeg run
# grant public access to new photos in s3
# npm run deploy
# change url dest in github

import PIL
from PIL import Image
import os

# change num for each use, create photos, imgs, and placeholders dir in utils dir
num = 236
files = os.listdir(os.getcwd()+"/imgs")
sortedFiles = sorted([tuple(x.lower().split('.')) for x in files],key=lambda kv: kv[1])
sortedFileNames = [x[0] + '.' + x[1] for x in sortedFiles]
print(sortedFileNames)

for filename in sortedFileNames:
    if filename.endswith(".gif") or filename.endswith(".png") or filename.endswith(".jpeg") or filename.endswith(".jpg"):
        newfilename = str(num) + '.' + filename.split('.')[1]
        basewidth = 50
        try:
            img = Image.open(os.getcwd()+"/imgs/"+filename)
        except PIL.UnidentifiedImageError:
            print(filename)
            continue
        img.save(os.getcwd()+"/photos/"+newfilename)
        wpercent = (basewidth / float(img.size[0]))
        hsize = int((float(img.size[1]) * float(wpercent)))
        img = img.resize((basewidth, hsize), PIL.Image.ANTIALIAS)
        img.save(os.getcwd()+"/placeholders/"+newfilename)
        num+=1
