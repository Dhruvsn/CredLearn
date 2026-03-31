const multer = require("multer");
const path = require("path");
const fs = require("fs");

// 1. Safety Check: Ensure the uploads folder actually exists, or create it.
const uploadDirectory = path.join(__dirname, "../public/uploads");
if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, { recursive: true });
}

// 2. Configure Disk Storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // 'cb' is the standard naming convention for callbacks
    cb(null, uploadDirectory);
  },
  filename: function (req, file, cb) {
    // Fix for the Overwrite Bug: Attach a timestamp so names are always unique
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    
    cb(null, `${baseName}-${uniqueSuffix}${extension}`);
  },
});

// 3. Create the upload middleware
const upload = multer({
  storage: storage,
  limits: {
    // Keeping this at 100MB for testing to prevent accidental local storage bloat
    fileSize: 100 * 1024 * 1024, 
  },
  fileFilter: function (req, file, cb) {
    // Only accept video files
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type, only video files are allowed"), false);
    }
  },
});

module.exports = upload;