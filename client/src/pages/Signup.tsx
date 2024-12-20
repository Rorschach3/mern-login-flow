import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Button } from "../components/ui/button";
import SignupForm from '../components/Auth/SignupForm';
import { AuthContext } from "../components/Auth/AuthContext";
import React from "react";

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthStatus } = useContext(AuthContext);

  return (
  <div className="flex h-100vh w-full px-40 m-50">
    <div className="flex content-center items-center flex-col mx-auto px-96">
      <SignupForm />

      <br></br>
        <Button
          onClick={() => {
            navigate("/dashboard"); // Adjust the navigation destination as needed
          }}
          className="flex content-end items-end left-14 max-w-[225px] bg-black text-white rounded-lg"
        >
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default Signup;
