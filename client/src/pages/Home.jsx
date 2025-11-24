import React from "react";
import Navbar from "../components/Navbar";
import Header from "../components/Header";

const Home = () => {
    return (
        <div
            className="flex flex-col items-center justify-center min-h-screen 
                        bg-[#0d1117] 
                        bg-gradient-to-br from-[#0d1117] via-[#0a0f1f] to-[#000000]
                        text-gray-200 relative"
        >
            {/* Subtle neon glow behind content */}
            <div
                className="absolute inset-0 pointer-events-none 
                            bg-[radial-gradient(circle_at_center,rgba(0,194,255,0.12),transparent_60%)]"
            ></div>

            <Navbar />
            <Header />
        </div>
    );
};

export default Home;
