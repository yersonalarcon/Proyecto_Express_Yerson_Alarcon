import jwt  from "jsonwebtoken";

const verifyToken = (req, res, next) => {
    const token = req.headers["authorization"];
    if (!token) {
        return res.status(403).json({ message: "Acceso denegado" });
    }
    try{
    const verified = jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: "Token inválido" });
        } else {
            req.user = decoded;
            next();
        }
    })
    }catch(err){
        return res.status(500).json({ message: "Error del servidor", error: err.message });
    }
}

export default verifyToken;