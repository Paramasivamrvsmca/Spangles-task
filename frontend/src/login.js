import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./AuthContext";
import "./Login.css"; // Import CSS file

export default function Login() {
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loading, setLoading] = useState(false);
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    // Email validation function
    const isValidEmail = (email) => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    };

    // Password validation function
    const isValidPassword = (password) => {
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);
    };

    // Handle input changes & live validation
    const handleChange = (e) => {
        const { name, value } = e.target;
        const trimmedValue = value.trim();

        setForm((prev) => ({ ...prev, [name]: trimmedValue }));

        // Live validation for email
        if (name === "email") {
            setEmailError(isValidEmail(trimmedValue) ? "" : "Invalid email format.");
        }

        // Live validation for password
        if (name === "password") {
            setPasswordError(
                isValidPassword(trimmedValue)
                    ? ""
                    : "Password must be at least 6 characters, contain uppercase, lowercase, number & special character."
            );
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // Final Validation Checks
        if (!form.email || !form.password) {
            setError("All fields are required.");
            return;
        }
        if (!isValidEmail(form.email)) {
            setError("Please enter a valid email address.");
            return;
        }
        if (!isValidPassword(form.password)) {
            setError("Password must contain uppercase, lowercase, number, and special character.");
            return;
        }

        setLoading(true);
        try {
            // Send login request directly to the backend
            const response = await fetch("http://localhost:5000/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email: form.email,
                    password: form.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Invalid email or password.");
            }

            // Store token and user details in context and local storage
            localStorage.setItem("token", data.token);
            setUser({ name: data.name });

            // Navigate to dashboard after successful login
            navigate("/dashboard");
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h2>Login</h2>
                {error && <p className="error-message">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                        {emailError && <p className="error-message">{emailError}</p>}
                    </div>
                    <div className="input-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        {passwordError && <p className="error-message">{passwordError}</p>}
                    </div>
                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? "Logging in..." : "Login"}
                    </button>
                </form>
                <p className="register-text">
                    Don't have an account? <a href="/register">Register</a>
                </p>
            </div>
        </div>
    );
}
