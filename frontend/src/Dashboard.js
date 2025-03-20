import { useContext } from "react";
import { AuthContext } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css"; // Import the CSS file for the dashboard page

export default function Dashboard() {
    const { user, setUser } = useContext(AuthContext);  // Using the AuthContext to get the user data
    const navigate = useNavigate();

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem("token");  // Remove token from localStorage
        setUser(null);  // Reset user context
        navigate("/");  // Redirect to login page
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-box">
                <h2>Welcome, {user ? user.name : "Spangles"}</h2>
                <p>Welcome to your dashboard! You're logged in.</p>
                <button className="logout-btn" onClick={handleLogout}>Log out</button>
            </div>
        </div>
    );
}
