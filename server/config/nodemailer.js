import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
    connectionTimeout: 10000, // 10s to establish connection
    greetingTimeout: 10000, // 10s to receive SMTP greeting
    socketTimeout: 15000, // 15s of inactivity before giving up
});

export default transporter;
