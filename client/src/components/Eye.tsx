import React from "react";
import eye from "../assets/icons/eye.svg";

const Eye = () => {
    return (
        <div>
            <img src={eye as string} className="bg-[rgba(217, 217, 217, 0.2)] h-[1.2rem] w-auto" alt="Eye" />
        </div>
    );
};

export default Eye;
