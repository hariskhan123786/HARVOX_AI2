import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (_req, file, cb) => {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/javascript',
    'text/css',
    'text/html',
    'text/markdown',
    'application/json',
    'application/xml',
  ];

  if (allowed.includes(file.mimetype) || file.mimetype.startsWith('text/') || file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('File type not supported'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

const audioFilter = (_req, file, cb) => {
  if (file.mimetype.startsWith('audio/') || file.mimetype.startsWith('video/') || file.originalname.endsWith('.webm') || file.originalname.endsWith('.wav') || file.originalname.endsWith('.mp3')) {
    cb(null, true);
  } else {
    cb(new Error('Only audio files are supported.'), false);
  }
};

export const uploadAudio = multer({
  storage,
  fileFilter: audioFilter,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB
});
