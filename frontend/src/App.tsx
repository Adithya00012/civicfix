import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Register from "./pages/Register";
import Login from "./pages/Login";
import ReportIssue from "./pages/ReportIssue";
import Dashboard from "./pages/Dashboard";
import AdminAnalytics from "./pages/AdminAnalytics";
import Assistant from "./pages/Assistant";
import PublicTransparency from "./pages/PublicTransparency";
import OAuthSuccess from "./pages/OAuthSuccess";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/assistant" element={<Assistant />} />
        <Route path="/public" element={<PublicTransparency />} />
        <Route path="/oauth-success" element={<OAuthSuccess />} />
      </Routes>
    </>
  );
}

export default App;