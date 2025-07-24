import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import MainPage from "./pages/mainPage";
import NotFound from "./pages/404";
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;