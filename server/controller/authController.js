import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";
import transporter from "../config/nodemailer.js";
import {
    EMAIL_VERIFY_TEMPLATE,
    PASSWORD_RESET_TEMPLATE,
} from "../config/emailTemplete.js";

// Register a new user
// This function checks if the user already exists, hashes the password, saves the user,
// sends a welcome email, and sets a JWT token as a cookie

export const register = async (req, res) => {
    console.log("Register request received");
    console.log(req.body);
    const { name, password } = req.body;

    const email = req.body?.email?.trim();

    if (!name || !email || !password) {
        return res.json({
            success: false,
            message: "Missing Details",
        });
    }

    // Simple email validation regex
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    const cleanEmail = email?.trim();

    if (!isValidEmail(cleanEmail)) {
        return res.json({
            success: false,
            message: "Invalid email format",
        });
    }

    try {
        // Check if user already exists
        const existingUser = await userModel.findOne({ cleanEmail });

        if (existingUser) {
            return res.json({
                success: false,
                message: "User already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new userModel({ name, email, password: hashedPassword });

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 100,
        });

        //sending welcome email

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: cleanEmail,
            subject: "welcome to auth",
            text: `Welcome to auth website. Your account has been created with email id :${email}`,
        };

        console.log("Sending email to:", mailOption);

        await transporter.sendMail(mailOption);

        console.log("c");
        await user.save();

        return res.json({
            success: true,
            message: "Registration successful",
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Login user and set cookie
// This function checks the user's credentials, generates a JWT token, and sets it as a cookie

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: "Email and Password are required",
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "Email invalid",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.json({
                success: false,
                message: "Password invalid",
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: "7d",
        });

        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
            maxAge: 7 * 24 * 60 * 60 * 100,
        });

        return res.json({
            success: true,
            message: "Login successful",
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Logout user and clear cookie
// This function clears the cookie and sends a response indicating successful logout

export const logout = async (req, res) => {
    console.log("Logout request received");
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
        });
        return res.json({
            success: true,
            message: "Logged out successfully",
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

//Send verification OTP to a user's email

export const sendVerifyOtp = async (req, res) => {
    try {
        //const { userId } = req.body;

        const { id } = req.user;

        const user = await userModel.findById(id);

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account already verified",
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000; // OTP valid for 1 Day

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Verify your account",
            //  text: `Your verification OTP is ${otp}. It is valid for 24 hours.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace(
                "{{email}}",
                user.email
            ),
        };

        await transporter.sendMail(mailOption);

        return res.json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

// Verify the OTP sent to the user's email

export const verifyEmail = async (req, res) => {
    const { otp } = req.body;
    const { id } = req.user;

    console.log("Verify email request received with OTP:", otp);
    console.log("User ID:", id);

    if (!id || !otp) {
        return res.json({
            success: false,
            message: "User ID and OTP are required",
        });
    }

    try {
        const user = await userModel.findById(id);

        // console.log("User found:", user);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: "Account already verified",
            });
        }

        if (user.verifyOtp !== otp) {
            return res.json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (Date.now() > user.verifyOtpExpireAt) {
            return res.json({
                success: false,
                message: "expired OTP",
            });
        }

        user.isAccountVerified = true;
        user.verifyOtp = " ";
        user.verifyOtpExpireAt = 0; // Reset OTP and expiration time

        await user.save();

        return res.json({
            success: true,
            message: "Email verified successfully",
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};

//Check if user is authenticated
// This function checks if the user is logged in by verifying the JWT token in the cookie

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true, message: "user is login" });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Send reset OTP to user's email
export const sendResetOtp = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.json({
            success: false,
            message: "Email is required",
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "user not found",
            });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000; // OTP valid for 15 min

        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: "Reset your password",
            //  text: `Your OTP for resetting your password is ${otp}. It is valid for 15 minutes.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace(
                "{{email}}",
                user.email
            ),
        };

        await transporter.sendMail(mailOption);

        return res.json({
            success: true,
            message: "OTP sent to your email",
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};

// Reset password using OTP
export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: "Email, OTP and new password are required",
        });
    }

    try {
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (Date.now() > user.resetOtpExpireAt) {
            return res.json({
                success: false,
                message: "Expired OTP",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = "";
        user.resetOtpExpireAt = 0; // Reset OTP and expiration time
        await user.save();

        return res.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        return res.json({
            success: false,
            message: error.message,
        });
    }
};
