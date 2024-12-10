import multer from 'multer';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// Multer configuration for file upload
const upload = multer({
  storage: multer.diskStorage({
    destination: 'public/uploads/',
    filename: (req, file, cb) => {
      // Generate unique filename to prevent overwriting
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  }),
});

// Next.js API config to disable default body parsing
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to process and compare images
const compareOMR = async (keyPath, userPath) => {
  const keyImage = await sharp(keyPath).greyscale().resize(800, 800).toBuffer();
  const userImage = await sharp(userPath).greyscale().resize(800, 800).toBuffer();

  // Simple pixel-by-pixel comparison
  const differences = [];
  for (let i = 0; i < keyImage.length; i++) {
    if (Math.abs(keyImage[i] - userImage[i]) > 30) {
      differences.push(i);
    }
  }

  return {
    totalPixels: keyImage.length,
    mismatchedPixels: differences.length,
    accuracy: ((keyImage.length - differences.length) / keyImage.length) * 100,
  };
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  upload.fields([
    { name: 'answerKey', maxCount: 1 },
    { name: 'userSheet', maxCount: 1 },
  ])(req, {}, async (err) => {
    if (err) {
      return res.status(500).json({ error: 'File upload failed.' });
    }

    const answerKeyPath = path.join(process.cwd(), req.files.answerKey[0].path);
    const userSheetPath = path.join(process.cwd(), req.files.userSheet[0].path);

    try {
      // Compare the images
      const comparisonResult = await compareOMR(answerKeyPath, userSheetPath);

      // Clean up uploaded files
      fs.unlinkSync(answerKeyPath);
      fs.unlinkSync(userSheetPath);

      // Respond with results
      res.status(200).json({
        success: true,
        comparisonResult,
      });
    } catch (err) {
      res.status(500).json({ error: 'Image processing failed.', details: err.message });
    }
  });
}
    