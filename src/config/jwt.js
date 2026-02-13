const jwt = require('jsonwebtoken');
require('dotenv').config();

// Configuración de JWT desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'UTEZ';

const generateToken = (payload)=>{
    return jwt.sign(payload, JWT_SECRET);
};

const auth = async(req, res, next)=>{
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if(!token) throw Error('Invalid Token');
        const decodeToken = jwt.verify(token, JWT_SECRET);
        req.token = decodeToken;
        next();
    } catch (error) {
        res.status(400).json({message:'Unauthorized'})
    }
};

const checkRoles = (roles)=>{
    return async(req, res, next)=>{
        try {
            
            const token = req.token;
            console.log(token);
            console.log(token.role + "  " + roles);
            if (!token) throw Error('Invalid Token');
            if(!roles.some((role)=>role === token.role)) throw Error('Invalid Role');
            next();
        } catch (error) {
            res.status(400).json({ message: 'Unauthorized role'});
        }
    }
};


module.exports = {
    generateToken, auth, checkRoles
}