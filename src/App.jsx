import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Router from "./Router";
function App() {
  return (
    <>
      <Navbar />
      <BrowserRouter>
        <Router />
      </BrowserRouter>
    </>
  );
}

export default App;
