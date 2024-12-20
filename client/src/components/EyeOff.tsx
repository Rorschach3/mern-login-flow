import React from "react";
import eyeOff from "../assets/icons/eyeOff.svg";
const EyeOff = () => {
    return (
        <div>
            <img src={eyeOff as string} className="bg-[rgba(217, 217, 217, 0.2)] h-[1.2rem] w-auto" alt="EyeOff" />
        </div>
    );
};

export default EyeOff;
