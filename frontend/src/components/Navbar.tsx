import { Link, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function Navbar() {
    const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setIsLoggedIn(!!localStorage.getItem("token"));
    }, [location]);

    function handleLogout() {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/login");
    }

    return (
        <nav className="bg-white shadow p-4 flex justify-between items-center">
            <Link to="/" className="font-bold text-blue-600">CivicFix</Link>
            <div className="space-x-4 text-sm">
                <Link to="/public">Public View</Link>
                {isLoggedIn && (
                    <>
                        <Link to="/">Dashboard</Link>
                        <Link to="/report">Report Issue</Link>
                        <Link to="/admin/analytics">Analytics</Link>
                        <Link to="/assistant">Assistant</Link>
                    </>
                )}
                {isLoggedIn ? (
                    <button onClick={handleLogout} className="text-red-600">Logout</button>
                ) : (
                    <>
                        <Link to="/login">Login</Link>
                        <Link to="/register">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;