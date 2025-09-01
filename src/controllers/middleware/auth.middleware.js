
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({ message: "Acceso denegado" });
    }
    try {
        const tokenWithoutBearer = token.split(" ")[1];
        const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(401).json({ message: "Token inválido" });
    }
};

export default verifyToken;
