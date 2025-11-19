import userModel from "../models/userModel.js";

export const getUserData = async (req, res) => {
    try {
        const { id } = req.user;

        console.log(id, "Request body received in getUserData");

        const user = await userModel.findById(id);

        console.log("User found:", user);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found",
            });
        }

        return res.json({
            success: true,
            userData: {
                name: user.name,
                email: user.email,
                isAccountVerified: user.isAccountVerified,
            },
        });
    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
};
