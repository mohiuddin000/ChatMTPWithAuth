import jwt from "jsonwebtoken";

const userAuth = async (req, res, next) => {
    const { token } = req.cookies;

    //console.log("Token received:", token);

    if (!token) {
        return res.json({
            success: false,
            message: "Not Authorized Login Again",
        });
    }

    try {
        const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

        //console.log("Token decoded:", tokenDecode);

        if (tokenDecode) {
            req.user = { id: tokenDecode.id };
            //req.body.userId = tokenDecode.id;
        } else {
            return res.json({
                success: false,
                message: "Not Authorized Login Again",
            });
        }

        // console.log(req.user.id);

        next();
    } catch (error) {
        console.error("Error during token verification:", error);

        return res.json({ success: false, message: error.message });
    }
};

export default userAuth;
