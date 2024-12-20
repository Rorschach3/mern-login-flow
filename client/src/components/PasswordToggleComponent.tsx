"use client";

import * as React from "react";
import Eye from "../components/Eye";
import EyeOff from "../components/EyeOff";
import { Input } from "../components/ui/input";

interface PasswordToggleComponentProps {
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const PasswordToggleComponent: React.FC<PasswordToggleComponentProps> = ({
    showPassword,
    setShowPassword,
    value,
    onChange,
}) => {
    return (
        <div className="relative w-full">
            {/* Password Input */}
            <Input
                type={showPassword ? "text" : "password"}
                value={value}
                onChange={onChange}
                placeholder="Password"
                required
            />

            {/* Eye Icon Toggle Button */}
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute w-auto mb-4 p-0 top-[18px] right-[0.5rem] transform -translate-y-1/2"
                aria-label={showPassword ? "Hide password" : "Show password"}
            >
                {showPassword ? <EyeOff /> : <Eye />}
            </button>
        </div>
    );
};

export default PasswordToggleComponent;
