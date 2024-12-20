import * as React from "react";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "../ui/input";
import { AuthContext } from "./AuthContext";
import PasswordToggleComponent from "../PasswordToggleComponent";
import { Button } from "../ui/button";
import { toast } from "sonner";
import axios from "axios";

const LoginForm: React.FC = () => {
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Send login request to the server
            const response = await axios.post("/api/user/login", { email, password });

            if (response.data.success) {
                // Store token and update authentication status
                await login(email, password);
                toast.success("Successfully logged in!");
                
                // Navigate to the overview page after success
                setTimeout(() => {
                    navigate("/Overview");
                }, 1000);
            } else {
                toast.error(response.data.message || "Invalid email or password.");
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || "An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full">
            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6 w-full">
                {/* Email Input */}
                <div>
                    <Input
                        className="flex rounded-full max-w-[100%] max-h-[1.8em] border-[1px] border-input bg-transparent px-4 py-1 text-base shadow-sm transition-colors placeholder-opacity-50 placeholder:text-muted-foreground mb-4 focus:ring-gray-400 transition-all duration-200 hover:backdrop-blur hover:bg-[rgba(255,255,255,0.8)] active:bg-[rgba(255,255,255,0.8)] disabled:cursor-not-allowed disabled:opacity-95 md:text-sm"
                        id="email"
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                {/* Password Input with Toggle */}
                <div className="relative mb-0">
                    <PasswordToggleComponent
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <Button
                    type="submit"
                    className={`content-start bg-gray-800 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                >
                    {loading ? "Logging in..." : "Login"}
                </Button>

                {/* Signup Button */}
                <Button
                    className={`content-start bg-gray-800 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                    disabled={loading}
                >Signup
                </Button>
            </form>
        </div>
    );
};

export default LoginForm;
