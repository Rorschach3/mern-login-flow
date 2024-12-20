import { useState, useContext } from 'react';
import { signup } from '../../api/UserApi';
import { useNavigate } from 'react-router-dom';
import { setToken } from '../../utils/authUtils';
import AuthContext from './AuthContext';
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import PasswordToggleComponent from "../PasswordToggleComponent";
import { toast } from 'sonner';

const SignupForm: React.FC = () => {
    const { setAuthStatus } = useContext(AuthContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        password: "",
    });

    const [loading, setLoading] = useState<boolean>(false);
    const [showPassword, setShowPassword] = useState(false);

    const { firstName, lastName, username, email, password } = formData;

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await signup(firstName, lastName, username, email, password);

            if (response.data.success) {
                toast.success(response.data.message || "Signup successful!");

                // Save token locally
                setToken(response.data.token);

                // Update authentication status
                setAuthStatus(true);

                // Navigate to login or another page
                setTimeout(() => {
                    navigate("/login");
                }, 1000);
            } else {
                toast.error(response.data.message || "Signup failed.");
            }
        } catch (err: any) {
            console.error("Signup error:", err.response?.data?.message || err.message);
            toast.error(err.response?.data?.message || "An error occurred during signup.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {/* First Name */}
            <Input
                className="w-full h-auto mb-3 border-[1px] text-base placeholder-opacity-50 placeholder:text-muted-foreground focus:outline-none focus:ring-gray-400 transition-all duration-200"
                type="text"
                name="firstName"
                value={firstName}
                onChange={onChange}
                placeholder="First Name"
            />

            {/* Last Name */}
            <Input
                className="w-full h-auto mb-3 border-[1px] text-base placeholder-opacity-50 placeholder:text-muted-foreground focus:outline-none focus:ring-gray-400 transition-all duration-200"
                type="text"
                name="lastName"
                value={lastName}
                onChange={onChange}
                placeholder="Last Name"
            />

            {/* Username */}
            <Input
                className="w-full h-auto mb-3 border-[1px] text-base placeholder-opacity-50 placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
                type="text"
                name="username"
                value={username}
                onChange={onChange}
                placeholder="Username"
            />

            {/* Email */}
            <Input
                className="w-full h-auto mb-3 border-[1px] text-base placeholder-opacity-50 placeholder:text-muted-foreground focus:outline-none transition-all duration-200"
                type="email"
                name="email"
                value={email}
                onChange={onChange}
                placeholder="Email"
                required
            />

            {/* Password */}
            <PasswordToggleComponent
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                value={password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />

            {/* Submit Button */}
            <Button
                type="submit"
                className={`w-full bg-gray-800 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                disabled={loading}
            >
                {loading ? "Signing up..." : "Sign Up"}
            </Button>
        </form>
    );
};

export default SignupForm;
