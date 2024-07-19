import './App.css';
import React, {useState} from 'react';
import axios from 'axios';


function App() {
  const [file, setFile] = useState();
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState();
  const [inputText, setInputText] = useState('');

  function handleChange(event) {
    setFile(event.target.files[0]);
  }

  function handleSubmit(event) {
    console.log("submit button called");
    event.preventDefault();
    const url = 'http://localhost:3001/uploadFile';//${uploadUrl}; //read upload url from config file
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

    axios.post(url, formData, config).then((response) => {
      console.log(response.data); // add a pop up element for upload success msg
    }).catch((error) => {
      console.error("Error uploading files: ", error);
      setError(error);
    });
  }

  return (
    <div className="App">
        <form onSubmit={handleSubmit}>
          <h1>AWS FullStack App</h1>
          <label>
          Text Input: <input type="text" value={inputText} onChange={e => setInputText(e.target.value)} />
          </label> 
          <hr />
          <label>
          <input type="file" onChange={handleChange}/>
          </label>
          <button type="submit">Upload</button>
          <progress value={uploadProgress} max="100"></progress>
        </form>
        {<p>Input Text is: {inputText}</p>}
        {error && <p>Error uploading file: {error.message}</p>}
    </div>
  );
}

export default App;
