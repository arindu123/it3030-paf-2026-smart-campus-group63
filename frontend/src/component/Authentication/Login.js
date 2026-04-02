import React from "react";

function Login() {

    const handleGoogleLogin = () => {
        window.location.href = "http://localhost:8082/oauth2/authorization/google";
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Smart Campus</h2>
                <p style={styles.subtitle}>Operations Hub</p>
                <p style={styles.desc}>Sign in to continue</p>

                <button
                    style={styles.googleBtn}
                    onClick={handleGoogleLogin}
                >
                    <img
                        src="https://developers.google.com/identity/images/g-logo.png"
                        alt="Google"
                        style={styles.googleIcon}
                    />
                    Sign in with Google
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#f5f5f5"
    },
    card: {
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "12px",
        boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
        textAlign: "center",
        width: "320px"
    },
    title: {
        fontSize: "24px",
        fontWeight: "600",
        color: "#1a1a1a",
        margin: "0 0 4px 0"
    },
    subtitle: {
        fontSize: "14px",
        color: "#666",
        margin: "0 0 24px 0"
    },
    desc: {
        fontSize: "13px",
        color: "#999",
        margin: "0 0 20px 0"
    },
    googleBtn: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        width: "100%",
        padding: "12px 16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        backgroundColor: "#fff",
        cursor: "pointer",
        fontSize: "14px",
        fontWeight: "500",
        color: "#333"
    },
    googleIcon: {
        width: "18px",
        height: "18px"
    }
};

export default Login;
