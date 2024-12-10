import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Set up file storage with multer
const upload = multer({ dest: 'public/uploads/' });

export const config = {
  api: {
    bodyParser: false,
  },
};

// Function for comparing OMR images
async function compareOMRImages(answerKeyPath, userSheetPath) {
  const answerKeyImage = sharp(answerKeyPath);
  const userSheetImage = sharp(userSheetPath);

  const [answerKeyMetadata, userSheetMetadata] = await Promise.all([
    answerKeyImage.metadata(),
    userSheetImage.metadata(),
  ]);

  if (
    answerKeyMetadata.width !== userSheetMetadata.width ||
    answerKeyMetadata.height !== userSheetMetadata.height
  ) {
    throw new Error('Images must have the same dimensions for comparison');
  }

  const [answerKeyData, userSheetData] = await Promise.all([
    answerKeyImage.raw().toBuffer(),
    userSheetImage.raw().toBuffer(),
  ]);

  const mismatches = [];
  const width = answerKeyMetadata.width;
  const height = answerKeyMetadata.height;

  // Compare pixel values
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      const index = (row * width + col) * 4;
      const answerKeyPixel = answerKeyData[index];
      const userSheetPixel = userSheetData[index];

      if (answerKeyPixel !== userSheetPixel) {
        mismatches.push({ row, col });
      }
    }
  }

  return mismatches;
}

export default async function handler(req, res) {
  upload.array('files', 2)(req, res, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'Image upload failed' });
    }

    const { files } = req;
    const answerKeyPath = path.join(process.cwd(), 'public', 'uploads', files[0].filename);
    const userSheetPath = path.join(process.cwd(), 'public', 'uploads', files[1].filename);

    try {
      const mismatches = await compareOMRImages(answerKeyPath, userSheetPath);

      if (mismatches.length === 0) {
        return res.status(200).json({ message: 'No mismatches detected' });
      } else {
        return res.status(200).json({ mismatches });
      }
    } catch (error) {
      return res.status(500).json({ error: 'Error processing images' });
    } finally {
      files.forEach((file) => fs.unlinkSync(path.join(process.cwd(), 'public', 'uploads', file.filename)));
    }
  });
}
