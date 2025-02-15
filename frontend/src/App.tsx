import React from "react";
import ActionSection from "./components/navbar"; 
import Home from "./pages/home";

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-5">
      <Home /> 
      
    </div>
  );
};

export default App;

