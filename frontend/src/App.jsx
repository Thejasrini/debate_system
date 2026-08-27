import React from "react";
import Home from "./pages/Home";
import StyleGuide from "./pages/StyleGuide";

function App() {
  if (typeof window !== "undefined" && window.location.pathname === "/style-guide") {
    return <StyleGuide />;
  }
  return <Home />;
}

export default App;