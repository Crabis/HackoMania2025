import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home"; // ✅ Import Home page
import RegisterPage from "./pages/register"; // ✅ Import Register page
import LoginPage from "./pages/login"; // ✅ Import Login page
import ChooseRolePage from "./pages/chooserole"; // ✅ Import Choose Role page

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-5">
        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/choose-role" element={<ChooseRolePage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
