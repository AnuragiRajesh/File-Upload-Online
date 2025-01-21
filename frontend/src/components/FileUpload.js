import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Ensure this line is present

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]); // Add this line
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    fetchUploadedFiles(); // Fetch uploaded files on component mount
  }, []);

  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get('http://localhost:4000/files');
      setUploadedFiles(response.data);
    } catch (error) {
      console.error('Error fetching uploaded files:', error);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const selectedFiles = Array.from(event.dataTransfer.files);
    setFiles(prevFiles => [...prevFiles, ...selectedFiles]);
    setDragging(false);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDelete = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const handleEdit = (index) => {
    const newName = prompt("Enter new name for the file:", files[index].name);
    if (newName) {
      setFiles(prevFiles => {
        const updatedFiles = [...prevFiles];
        updatedFiles[index] = new File([prevFiles[index]], newName, { type: prevFiles[index].type });
        return updatedFiles;
      });
    }
  };

  const handleDownload = (file) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('myFile', file); // Ensure this line is correct
    });

    try {
      const response = await axios.post('http://localhost:4000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      alert(response.data.message);
    } catch (error) {
      console.error('Error uploading files:', error); // Log the error
      alert(`Error uploading files: ${error.message}`);
    }
  };

  const handleDeleteUploadedFile = async (fileName) => {
    try {
      await axios.delete(`http://localhost:4000/files/${fileName}`);
      fetchUploadedFiles(); // Refresh the list of uploaded files
    } catch (error) {
      console.error('Error deleting file:', error);
    }
  };

  const handleDownloadUploadedFile = (fileName) => {
    const url = `http://localhost:4000/uploads/${fileName}`;
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <h1>Upload File and Folder</h1>
      <input type="file" webkitdirectory="true" directory="true" multiple onChange={handleFileChange} />
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        style={{
          border: dragging ? '2px dashed #000' : '2px solid transparent',
          padding: '20px',
          marginTop: '20px'
        }}
      >
        <p>Drag and drop files here</p>
      </div>
      <h2>Uploaded Files and Folders</h2>
      <ul>
        {files.map((file, index) => (
          <li key={index}>
            {file.webkitRelativePath || file.name}
            <button onClick={() => handleEdit(index)}>Edit</button>
            <button onClick={() => handleDelete(index)}>Delete</button>
          </li>
        ))}
      </ul>
      <button onClick={handleUpload}>Upload</button>
      <h2>Previously Uploaded Files</h2> {/* Add this section */}
      <ul>
        {uploadedFiles.map((file, index) => (
          <li key={index}>
            {file}
            <button onClick={() => handleEdit(index)}>Edit</button> {/* Reuse handleEdit */}
            <button onClick={() => handleDeleteUploadedFile(file)}>Delete</button> {/* Add this line */}
            <button onClick={() => handleDownloadUploadedFile(file)}>Download</button> {/* Add this line */}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
