const jwt = require('jsonwebtoken');
const { query } = require('../utils/mysql');
require('dotenv').config();

// Configuración de JWT desde variables de entorno
const JWT_SECRET = process.env.JWT_SECRET || 'UTEZ';

const generateToken = (payload)=>{
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
};

const auth = async(req, res, next)=>{
    try {
        console.log('=== MIDDLEWARE AUTH ===');
        const token = req.headers.authorization?.replace('Bearer ', '');
        console.log('1. Token recibido:', token ? 'SÍ' : 'NO');

        if(!token) throw Error('Invalid Token');

        const decodeToken = jwt.verify(token, JWT_SECRET);
        console.log('2. Token decodificado:', decodeToken);

        // Validar que el usuario siga activo en la base de datos
        const sql = `SELECT status FROM users WHERE id = ?`;
        console.log('3. Query SQL:', sql, 'con ID:', decodeToken.id);

        const userStatus = await query(sql, [decodeToken.id]);
        console.log('4. Resultado de BD:', userStatus);

        // Verificación defensiva: usuario debe existir y estar activo
        if(!Array.isArray(userStatus) || userStatus.length === 0) {
            console.log('❌ Usuario no existe en BD:', decodeToken.id);
            throw Error('User does not exist');
        }

        if(!userStatus[0] || userStatus[0].status !== 1) {
            console.log('❌ Usuario inactivo:', decodeToken.id, 'Status:', userStatus[0]?.status);
            throw Error('User is inactive');
        }

        console.log('✅ Usuario válido y activo:', decodeToken.id);
        req.token = decodeToken;
        next();
    } catch (error) {
        console.log('❌ Error en autenticación:', error.message);
        res.status(401).json({message:'Unauthorized'})
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
            res.status(403).json({ message: 'Forbidden - Insufficient permissions'});
        }
    }
};


module.exports = {
    generateToken, auth, checkRoles
}