const {Response, Router} = require("express");
const {validateError} = require("../../../utils/functions");
const {login, signup, changePassword} = require("./auth.gateway");
const { auth, checkRoles } = require('../../../config/jwt');

const singin = async(req, res=Response)=>{
    try {
        const {email, password} = req.body;
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
        const {email, oldpassword, newpassword} = req.body;
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