import React from "react";
import ActionSection from "./components/navbar"; // ✅ Import Navbar

const App: React.FC = () => {
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100 p-5">
      <h1 className="text-4xl font-bold text-center mb-6">Testing ActionSection Navbar</h1>
      <ActionSection /> {/* ✅ Rendering the Navbar */}
    </div>
  );
};

export default App;

