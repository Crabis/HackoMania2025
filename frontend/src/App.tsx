import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/home';  
import LoginPage from './pages/login';
import RegisterPage from './pages/register';

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-5">
        <Routes>
          <Route path="/" element={<Home />} /> {/* Home is the default route */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
