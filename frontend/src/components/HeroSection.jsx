import { useState } from "react";
import { shortenUrl } from "../api/url";
const HeroSection = () => {
  const [url, setUrl] = useState("");
  const [shortUrl, setShortUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (shortUrl) {
      navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  const handleShorten = async () => {
    if (!url) return;
    const data = await shortenUrl(url);
    console.log("Shortened URL:", data);
    setIsLoading(true);
    setTimeout(() => {
      setShortUrl(data.shortId);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <section id="home" className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-300 opacity-10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative container mx-auto px-6 py-20 text-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
          Shorten URLs in <span className="text-yellow-400">Seconds</span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 text-blue-100 max-w-3xl mx-auto animate-fade-in delay-300">
          Secure, fast, and powerful link shortener with analytics and more
        </p>

        <div className="max-w-2xl mx-auto bg-white backdrop-blur-md rounded-2xl p-8 animate-fade-in delay-500">
          <div className="flex flex-col md:flex-row gap-4 ">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter your long URL here"
              className="flex-1 px-6 py-4 rounded-xl text-gray-800 placeholder-gray-500 border-2 border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/50 transition-all duration-300"
            />
            <button
              onClick={handleShorten}
              disabled={isLoading || !url}
              className="px-8 py-4 bg-yellow-400 text-gray-900 font-semibold rounded-xl hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                  Shortening...
                </div>
              ) : (
                "Shorten Now"
              )}
            </button>
          </div>

          {shortUrl && (
            <div className="mt-6 p-4 border-2 border-yellow-400 bg-gradient-to-r from-blue-700 via-purple-700 to-blue-900 rounded-2xl shadow-lg animate-fade-in">
              <p className="text-sm text-yellow-300 mb-2 font-semibold">
                Your shortened URL:
              </p>
              <div className="flex items-center gap-3">
                <code className="flex-1 text-yellow-200 font-mono text-lg bg-black px-3 py-2 rounded-lg break-all border border-yellow-400 shadow-inner">
                  {shortUrl}
                </code>
                <button
                  className="px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors shadow-md border border-yellow-300"
                  onClick={handleCopy}
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
