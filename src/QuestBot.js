import React, { useState } from 'react';
import axios from 'axios';
import Plot from 'react-plotly.js';
import './Questbot.css';
import image from './Assets/logo.png';
import up from './Assets/up.png';
import Butterfly from './Assets/Butterfly.png'

const App = () => {
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [graphData, setGraphData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleQuerySubmit = async () => {
    setError('');
    setAnswer('');
    setGraphData(null);

    try {
      setLoading(true);
      const response = await axios.post('http://127.0.0.1:5000/generate', { query });
      const data = response.data;
      if (data.error) {
        setError(`Error: ${data.error}`);
      } else {
        setAnswer(data['1']);
        if(data['2']){
          setGraphData(data['2']);
        }
      }
    } catch (err) {
      setError(`Error: ${err.message}`);
    }
    finally{
      setLoading(false);
      setQuery("");
    }
  };

  const Loader = () => {
    return (
        <span className="load"></span>
    );
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && query.trim() !== "") {
      event.preventDefault();
      handleQuerySubmit();
    }
  };

  return (
    <div className="body">
      <div className="header">
          <img src={image} alt="logo" />
      </div>
      <div className='main'>
        <div className='in'>
          <div className='head'>
            <div className='in-head'>
              <img src={Butterfly}/>
              <h1>Hello, I'm <span style={{ color: "#2C9640", letterSpacing: "3px"}}>Morphia.</span></h1>
            </div>
            <h3>How can I assist you today?</h3>
          </div>
          <div className='inhold'>
            <input
              type="text"
              placeholder= "Enter your query"
              value= {!loading?query:"Generating..."}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className='ph'
            />
            {!loading?<img src={up} alt="arrow" className="input-icon" onClick={handleQuerySubmit}/>:<Loader/>}
          </div>
        </div>
        <div className='output'>
          <div className='in-out'>
            {(answer || error) && <img src={Butterfly} className='icon'/>}
            {error && <div className='err'>Sorry for the inconveneince, Problem in processing the query!</div>}
            {answer && (
              <div className='answer'>
                <p>{answer}</p>
              </div>
            )}
          </div>
        {graphData && (
          <div>
            <Plot data={graphData.data} layout={graphData.layout} />
          </div>
        )}
        </div>
      </div>
    </div>
  );
};

export default App;