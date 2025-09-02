const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-6 mt-12 text-gray-600">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="flex items-center gap-3 mb-4 md:mb-0">
          <img src="./src/assets/Logo.jpeg" alt="URL Shortener Logo" className="h-8 w-8 rounded-full border" />
          <span className="font-semibold text-lg tracking-wide">URL Shortener</span>
        </div>
        <nav className="flex gap-6 text-sm">
          <a href="/" className="hover:text-blue-600 transition" aria-label="Home">Home</a>
          <a href="/dashboard" className="hover:text-blue-600 transition" aria-label="Dashboard">Dashboard</a>
          <a href="/contact" className="hover:text-blue-600 transition" aria-label="Contact">Contact</a>
        </nav>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="https://github.com/LalithKumar77" target="_blank" rel="noopener noreferrer" aria-label="GitHub" className="hover:text-gray-800">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.02c-3.2.7-3.87-1.54-3.87-1.54-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.79 1.2 1.79 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98.01 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.43-2.7 5.41-5.27 5.7.42.36.8 1.09.8 2.2v3.26c0 .31.21.67.8.56A10.99 10.99 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"/></svg>
          </a>
          <a href="mailto:allulalithkumar77@gmail.com" aria-label="Email" className="hover:text-gray-800">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zm0 12H4V8l8 5 8-5v10z"/></svg>
          </a>
        </div>
      </div>
      <div className="text-center text-xs text-gray-400 mt-4">
        &copy; {new Date().getFullYear()} URL Shortener. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
