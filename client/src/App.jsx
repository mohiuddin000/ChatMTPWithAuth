import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import EmailVerify from "./pages/EmailVerify";
import { ToastContainer } from "react-toastify";
import ChatPage from "./pages/ChatPage";

const App = () => {
    return (
        <div>
            <ToastContainer />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route path="/email-verify" element={<EmailVerify />} />
                <Route path="/chat" element={<ChatPage />} />
            </Routes>
        </div>
    );
};

export default App;
