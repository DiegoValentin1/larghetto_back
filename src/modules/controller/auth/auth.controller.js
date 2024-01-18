const {Response, Router} = require("express");
const {validateError} = require("../../../utils/functions");
const {login, signup, changePassword} = require("./auth.gateway");
const { auth, checkRoles } = require('../../../config/jwt');
const { insertLog } = require("../stats/stats.gateway");

const singin = async(req, res=Response)=>{
    try {
        const {email, password} = req.body;
        await insertLog({email, accion:`El usuario ${email} ha iniciado sesión`});
        const token = await login({email, password});
        res.status(200).json(token);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json(message);
    }
}

const register = async(req, res=Response)=>{
    try {
        const {email, password, role, name, empresa} = req.body;
        await insertLog({email, accion:`Nuevo usuario ${email} registrado`});
        await signup({email, password, role, name, empresa});
        res.status(200).json("OK");
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json(message);
    }
}

const swapPass = async(req, res=Response)=>{
    try {
        const {email, oldpassword, newpassword, empleado} = req.body;
        await insertLog({empleado, accion:`Contraseña de ${email} modificada`});
        const token = await changePassword({email, oldpassword, newpassword});
        res.status(200).json(token);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json(message);
    }
}

const authRouter = Router();
authRouter.post('/', singin);
authRouter.post('/register', register);
authRouter.post('/changepass', swapPass);

module.exports = {
    authRouter
}