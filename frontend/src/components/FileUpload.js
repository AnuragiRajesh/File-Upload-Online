import React, { useState } from 'react';

const FileUpload = () => {
  const [files, setFiles] = useState([]);
  const [dragging, setDragging] = useState(false);

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
            <button onClick={() => handleDownload(file)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FileUpload;
