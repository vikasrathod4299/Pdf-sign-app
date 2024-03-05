import { Route, Routes } from "react-router-dom";
import AssignUser from "./pages/AssignUser";
import Dashboard from "./pages/Dashboard";
import PrepareDocuments from "./pages/PrepareDocuments";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import PrepareDocuments2 from "./pages/PrepareDocuments2";

const router = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assignUser" element={<AssignUser />} />
          <Route path="/prepareDocument" element={<PrepareDocuments />} />
          <Route path="/prepareDocument2" element={<PrepareDocuments2 />} />
        </Route>
      </Routes>
    </div>
  );
};

export default router;
