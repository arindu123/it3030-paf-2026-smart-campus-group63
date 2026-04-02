import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

function AuthCallback() {
    const { login } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // URL: /auth/callback?token=eyJhbGci...
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token");

        if (token) {
            login(token);
            navigate("/home");
        } else {
            navigate("/login");
        }
    }, []);

    return (
        <div style={styles.container}>
            <p style={styles.text}>Logging you in...</p>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh"
    },
    text: {
        fontSize: "16px",
        color: "#666"
    }
};

export default AuthCallback;
