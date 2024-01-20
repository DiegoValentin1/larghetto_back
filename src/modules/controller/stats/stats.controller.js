const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const { findAllTotal, findAllCentro, findAllBuga, findAllCuautla, findAllActual, guardarActual, findAllAlumnoPagos, findAlumnoPagosMesCampus, findAlumnoPagosMes } = require('./stats.gateway');

const getAllTotal = async(req, res=Response)=>{
    try {
        const stat = await findAllTotal();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllCentro = async(req, res=Response)=>{
    try {
        const stat = await findAllCentro();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllBuga = async(req, res=Response)=>{
    try {
        const stat = await findAllBuga();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllCuautla = async(req, res=Response)=>{
    try {
        const stat = await findAllCuautla();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllActual = async(req, res=Response)=>{
    try {
        const stat = await findAllActual();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const saveActual = async(req, res=Response)=>{
    try {
        const stat = await guardarActual();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllAlumnoPagos = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const stat = await findAllAlumnoPagos(id);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoPagosMes = async(req, res=Response)=>{
    try {
        const stat = await findAlumnoPagosMes();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoPagosMesCampus = async(req, res=Response)=>{
    try {
        const {campus} = req.params;
        const stat = await findAlumnoPagosMesCampus(campus);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}



const statsRouter = Router();

statsRouter.get('/total/', getAllTotal);
statsRouter.get('/centro/', getAllCentro);
statsRouter.get('/buga/', getAllBuga);
statsRouter.get('/cuautla/', getAllCuautla);
statsRouter.get('/actual/', getAllActual);
statsRouter.get('/save/', saveActual);
/*-------*/
statsRouter.get('/pagos/:id', getAllAlumnoPagos);
statsRouter.get('/pagos/suma/', getAlumnoPagosMes);
statsRouter.get('/pagos/suma/:campus', getAlumnoPagosMesCampus);

module.exports = {statsRouter, };