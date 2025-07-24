import  { useState } from "react";
import axios from "axios";
import "./mainPage.css";
const MainPage = () => {
  const [shortUrl, setShortUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const getUrl = async () => {
    const url = document.getElementById("input").value;
    if (!url) {
      setError("Please enter a URL");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const response = await axios.post("http://localhost:3000/api/url", { url });
      setShortUrl(response.data.shortId);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      setError("Failed to shorten URL. Please try again.");
      console.error(err);
    }
  };
  

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="bubbles">
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
        <div className="bubble"></div>
      </div>
      
      <div className="main">
        <h1>URL Shortener</h1>
        <p className="description">Transform long URLs into short, shareable links with just one click!</p>
        
        <div className="input-container">
          <input 
            placeholder="Enter the URL or paste URL here" 
            id="input"
            onKeyPress={(e) => e.key === 'Enter' && getUrl()}
          />
        </div>
        
        {error && <p className="error">{error}</p>}
        
        <button onClick={getUrl} disabled={loading}>
          {loading ? (
            <>
              <span className="loading-spinner"></span>
              Shortening...
            </>
          ) : "Shorten URL"}
        </button>
        
        {shortUrl && (
          <div className="result-container">
            <span className="result-url">{shortUrl}</span>
            <button className="copy-button" onClick={copyToClipboard}>
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default MainPage;