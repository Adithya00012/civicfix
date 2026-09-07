import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { subscribeToPush } from "../lib/push";

function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        const token = searchParams.get("token");
        if (token) {
            localStorage.setItem("token", token);
            subscribeToPush();
            navigate("/");
        } else {
            navigate("/login");
        }
    }, []);

    return <p className="p-6">Logging you in...</p>;
}

export default OAuthSuccess;