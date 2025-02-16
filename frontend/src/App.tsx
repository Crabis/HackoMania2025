import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home"; // ✅ Import Home page
import RegisterPage from "./pages/register"; // ✅ Import Register page
import LoginPage from "./pages/login"; // ✅ Import Login page
import ProfilePage from "./pages/profile"; // ✅ Import Choose Role page
import ResetPasswordPage from "./pages/resetpassword";
import AboutPage from "./pages/about";
import WarriorHomePage from "./pages/warriorhome";
import GuardianPanel from "./pages/guardianpage";
import RegisterWarrior from "./pages/buddyregisterwarrior";
import ViewBuddyWarriors from "./pages/yourwarriorhome";
import WarriorRegisterBuddy from "./pages/warriorregisterbuddy";
import { View } from "lucide-react";
import MentorHomePage from "./pages/mentorhome";
import SessionsMentorPage from "./pages/sessionsmentor";
import SessionsWarriorPage from "./pages/sessionswarrior";
import ManageWarriorsPage from "./pages/managewarriors";
import RewardsShop from "./pages/rewards";

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex flex-col items-center min-h-screen bg-gray-100 p-5">
        {/* Routes */}
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/warrior-home" element={<WarriorHomePage />} />
          <Route path="/guardian-panel" element={<GuardianPanel />} />
          <Route path="/register-warrior-buddy" element={<RegisterWarrior/>} />
          <Route path="/attached-warrior-home" element={<ViewBuddyWarriors/>} />
          <Route path="/register-a-buddy" element={<WarriorRegisterBuddy/>} />
          <Route path="/mentor-home" element={<MentorHomePage />} />
          <Route path="/sessions-mentor" element={<SessionsMentorPage />} />
          <Route path="/sessions-warrior" element={<SessionsWarriorPage />} />
          <Route path="/manage-warriors" element={<ManageWarriorsPage />} />
          <Route path="/rewards" element={<RewardsShop />} />
          
        </Routes>
      </div>
    </Router>
  );
};

export default App;
