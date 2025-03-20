import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css"; 

export default function Register() {
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
    });
    const [errors, setErrors] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const navigate = useNavigate();

    const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
    const isValidPhone = (phone) => /^[0-9]{10}$/.test(phone);
    const isValidPassword = (password) =>
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,}$/.test(password);

    const validateField = (name, value) => {
        if (name === "name" && value.length < 3) return "Name must be at least 3 characters.";
        if (name === "email" && !isValidEmail(value)) return "Invalid email format.";
        if (name === "phone" && !isValidPhone(value)) return "Phone number must be 10 digits.";
        if (name === "password" && !isValidPassword(value)) 
            return "Password must contain uppercase, lowercase, number & special character.";
        if (name === "confirmPassword" && value !== form.password) return "Passwords do not match.";
        return "";
    };

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({ ...prevForm, [name]: value }));
        setErrors((prevErrors) => ({ ...prevErrors, [name]: validateField(name, value) }));
    }, [form.password]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};
        
        Object.keys(form).forEach((key) => {
            const error = validateField(key, form[key]);
            if (error) newErrors[key] = error;
        });
        
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;
        
        try {
            // Directly handling POST request to register API
            const response = await fetch("http://localhost:5000/api/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: form.name,
                    email: form.email,
                    phone: form.phone,
                    password: form.password,
                }),
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message || "Registration failed");
            }

            // Navigate to home page or wherever after successful registration
            navigate("/");

        } catch (error) {
            setErrors((prevErrors) => ({ ...prevErrors, server: error.message }));
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h2>Register</h2>
                <form onSubmit={handleSubmit}>
                    {Object.entries(form).map(([key, value]) => (
                        key !== "password" && key !== "confirmPassword" ? (
                            <div key={key} className="input-group">
                                <label>{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input type={key === "email" ? "email" : "text"} name={key} value={value} placeholder={`Enter your ${key}`} onChange={handleChange} />
                                {errors[key] && <p className="error-message">{errors[key]}</p>}
                            </div>
                        ) : null
                    ))}

                    {["password", "confirmPassword"].map((key) => (
                        <div key={key} className="input-group">
                            <label>{key === "password" ? "Password" : "Confirm Password"}</label>
                            <div className="password-container">
                                <input type={(key === "password" ? showPassword : showConfirmPassword) ? "text" : "password"} name={key} placeholder={`Enter your ${key}`} value={form[key]} onChange={handleChange} />
                                <button type="button" className="toggle-btn" onClick={() => key === "password" ? setShowPassword(!showPassword) : setShowConfirmPassword(!showConfirmPassword)} >
                                    {(key === "password" ? showPassword : showConfirmPassword) ? "🙈" : "👁️"}
                                </button>
                            </div>
                            {errors[key] && <p className="error-message">{errors[key]}</p>}
                        </div>
                    ))}

                    {errors.server && <p className="error-message">{errors.server}</p>}
                    
                    <button type="submit" className="register-btn">Register</button>
                </form>

                <p className="login-text">
                    Already have an account? <a href="/login">Login</a>
                </p>
            </div>
        </div>
    );
}
