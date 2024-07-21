import './App.css';
import React, {useState} from 'react';
import axios from 'axios';
import { backendUrl  } from './config';


function App() {
  const [file, setFile] = useState();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState();
  const [success, setSuccess] = useState(false);
  const [inputText, setInputText] = useState('');

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function handleSubmit(event) {
    console.log("submit button called");
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setUploadProgress(0);
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('inputText', inputText);

    const config = {
      headers: {
        'content-type': 'multipart/form-data'
      },
      onUploadProgress: function(progressEvent) {
        const percentComplete = Math.round((progressEvent.loaded * 100)/progressEvent.total);
        setUploadProgress(percentComplete); 
      }
    };

    axios.post(backendUrl, formData, config).then((response) => {
      console.log(response.data); // add a pop up element for upload success msg
      setSuccess(true);
    }).catch((error) => {
      console.error("Error uploading files: ", error);
      if (error.response) {
        setError(`Server error: ${error.response.status}`, JSON.stringify(error.response.data));
      } else if (error.request) {
        setError('Network error: No response received from server');
      } else {
        setError(`Error: ${error.message}`);
      }
      // setError(error.response?.data?.message || error.message || 'An unknown error occurred');
      // setError(error);
    });
  }

  return (
    <div className="container">
      <h1 className="title">AWS FullStack App</h1>
      <form onSubmit={handleSubmit} className="form">
        <div className="input-group">
          <label htmlFor="inputText" className="label">Text Input</label>
          <input
            id="inputText"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter some text"
            className="input"
          />
        </div>
        <div className="input-group">
          <label htmlFor="file" className="label">File Upload</label>
          <input
            id="file"
            type="file"
            onChange={handleChange}
            className="file-input"
          />
        </div>
        <button type="submit" className="button">Upload</button>
      </form>
      
      {uploadProgress > 0 && (
        <div className="progress-container">
          <div className="progress-bar" style={{width: `${uploadProgress}%`}}></div>
          <p className="progress-text">{uploadProgress}% uploaded</p>
        </div>
      )}
      
      {success && (
        <div className="success-message">File uploaded successfully!</div>
      )}
      
      {error && (
        <div className="error-message">{error.toString()}</div>
      )}
      
      {inputText && (
        <p className="input-text-display">Input Text is: {inputText}</p>
      )}
    </div>
    // <div className="App">
    //     <form onSubmit={handleSubmit}>
    //       <h1>AWS FullStack App</h1>
    //       <label>
    //       Text Input: <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} />
    //       </label> 
    //       <hr />
    //       <label>
    //       <input type="file" onChange={handleChange}/>
    //       </label>
    //       <button type="submit">Upload</button>
    //       <progress value={uploadProgress} max="100"></progress>
    //     </form>
    //     {<p>Input Text is: {inputText}</p>}
    //     {error && <p>Error uploading file: {error.message}</p>}
    // </div>
  );
}

export default App;
