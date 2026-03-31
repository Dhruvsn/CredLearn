const multer = require("multer");

// we use memory storage so the file is kept as a buffer in memory.

const storage = multer.diskStorage({
  destination: function (req, file, db) {
    db(null, "../../public/uploads");
  },
  filename: function (req, file, db) {
    db(null, file.originalname);
  },
});

// creat the upload middleware

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1000 * 1024 * 1024, // limit file size to 1000MB
  },
  fileFilter: function (req, file, db) {
    // only accept video files
    if (file.mimetype.startsWith("video/")) {
      db(null, true);
    } else {
      db(new Error("Invalid file type, only video files are allowed"), false);
    }
  },
});

module.exports = upload;
