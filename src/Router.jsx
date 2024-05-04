import { Route, Routes } from "react-router-dom";
import AssignUser from "./pages/AssignUser";
import Dashboard from "./pages/Dashboard";
import PrepareDocuments from "./pages/PrepareDocuments";
import ProtectedRoute from "./components/ProtectedRoute";
import SignDocuments from "./pages/SignDocuments";
import Register from "./pages/Register";
import ViewDocs from "./pages/ViewDocs";
import Login2 from "./pages/Login2";
const router = () => {
  return (
    <div>
      <Routes>
        <Route path="/login" element={<Login2 />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/assignUser" element={<AssignUser />} />
          <Route path="/prepareDocument" element={<PrepareDocuments />} />
          <Route path="/view-docs/:id" element={<ViewDocs />} />
        </Route>
        <Route path="/signDocument/:id" element={<SignDocuments />} />
      </Routes>
    </div>
  );
};

export default router;
