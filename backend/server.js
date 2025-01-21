const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors'); // Ensure this line is present
const fs = require('fs'); // Add this line

const app = express();
const PORT = process.env.PORT || 4000; // Ensure the port matches

// Enable CORS
app.use(cors()); // Ensure this line is present

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
  }
});

// Init upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // Increase file size limit to 5MB
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
}).array('myFile', 10); // Change to handle multiple files

// Check file type
function checkFileType(file, cb) {
  // Allowed ext
  const filetypes = /jpeg|jpg|png|gif/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb('Error: Images Only!');
  }
}

// Public folder
app.use(express.static('./public'));

// Upload endpoint
app.post('/upload', (req, res) => {
  console.log('Upload request received'); // Add this line
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err); // Add this line
      res.status(400).send({ message: err });
    } else {
      if (req.files.length === 0) {
        console.warn('No file selected'); // Add this line
        res.status(400).send({ message: 'No file selected!' });
      } else {
        console.log('Files uploaded successfully:', req.files); // Add this line
        res.send({
          message: 'Files uploaded!',
          files: req.files.map(file => `uploads/${file.filename}`)
        });
      }
    }
  });
});

// GET endpoint to list uploaded files
app.get('/files', (req, res) => {
  const directoryPath = path.join(__dirname, 'uploads');
  fs.readdir(directoryPath, (err, files) => {
    if (err) {
      return res.status(500).send({ message: 'Unable to scan files!' });
    }
    res.send(files);
  });
});

// DELETE endpoint to delete a file
app.delete('/files/:fileName', (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(__dirname, 'uploads', fileName);
  fs.unlink(filePath, (err) => {
    if (err) {
      return res.status(500).send({ message: 'Unable to delete file!' });
    }
    res.send({ message: 'File deleted!' });
  });
});

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
