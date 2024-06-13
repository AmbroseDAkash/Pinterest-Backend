// Install multer and uuid
// npm install multer uuid

const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

// Configure storage for Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads');
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
    // The above code extracts the extension from the original file name and appends it to the unique identifier
  }
});

// Initialize Multer with the storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
