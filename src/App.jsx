import { BrowserRouter } from "react-router-dom";
import "./App.css";
import Navbar from "./components/Navbar";
import Router from "./Router";
import { pdfjs } from "react-pdf";
import UserQueryProvider from "./components/Provider";
import AuthProvider from "./hooks/useAuth";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.js",
  import.meta.url
).toString();
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
function App() {
  return (
    <>
      <Navbar />
      <UserQueryProvider>
        <AuthProvider>
          <BrowserRouter>
            <Router />
          </BrowserRouter>
        </AuthProvider>
      </UserQueryProvider>
    </>
  );
}

export default App;
