const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const { findAllTotal, findAllCentro, findAllBuga, findAllCuautla, findAllActual, guardarActual, findAllAlumnoPagos, findAlumnoPagosMesCampus, findAlumnoPagosMes, findAllAlumnoInscripciones, findAllAlumnoInscripcionesCampus, lastThree, findAllAlumnoFaltantesCampus, findAllAlumnoFaltantes, findAllAlumnoMensualidadesCampusSumaFaltaMasPagos, findAllAlumnoMensualidadesSumaFaltaMasPagos, findAllCdmx, findHistoricoAlumnos, findHistoricoPagos } = require('./stats.gateway');

const getAllTotal = async(req, res=Response)=>{
    try {
        const { year } = req.query;
        const stat = await findAllTotal(year);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllCentro = async(req, res=Response)=>{
    try {
        const { year } = req.query;
        const stat = await findAllCentro(year);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllBuga = async(req, res=Response)=>{
    try {
        const { year } = req.query;
        const stat = await findAllBuga(year);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllCuautla = async(req, res=Response)=>{
    try {
        const { year } = req.query;
        const stat = await findAllCuautla(year);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllCdmx = async(req, res=Response)=>{
    try {
        const { year } = req.query;
        const stat = await findAllCdmx(year);
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

const getLastThree = async(req, res=Response)=>{
    try {
        const {campus} = req.params;
        const stat = await lastThree(campus);
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

const getAlumnoTotalMensualidades = async(req, res=Response)=>{
    try {
        const stat = await findAllAlumnoMensualidadesSumaFaltaMasPagos();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoTotalMensualidadesCampus = async(req, res=Response)=>{
    try {
        const {campus} = req.params;
        const stat = await findAllAlumnoMensualidadesCampusSumaFaltaMasPagos(campus);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}


const getAlumnoTotalInscripciones = async(req, res=Response)=>{
    try {
        const stat = await findAllAlumnoInscripciones();
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoTotalInscripcionesCampus = async(req, res=Response)=>{
    try {
        const {campus} = req.params;
        const stat = await findAllAlumnoInscripcionesCampus(campus);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoTotalfaltantesCampus = async(req, res=Response)=>{
    try {
        const {campus} = req.params;
        const stat = await findAllAlumnoFaltantesCampus(campus);
        console.log(stat, "lolll");
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoTotalFaltantes = async(req, res=Response)=>{
    try {
        
        const stat = await findAllAlumnoFaltantes();
        console.log(stat);
        res.status(200).json(stat);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

// ========================================
// CONTROLADORES DE REPORTES HISTÓRICOS
// ========================================

const getHistoricoAlumnos = async (req, res = Response) => {
    try {
        const {year, campus} = req.query;
        const historico = await findHistoricoAlumnos(year, campus);
        res.status(200).json(historico);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getHistoricoPagos = async (req, res = Response) => {
    try {
        const { year } = req.query;
        const historico = await findHistoricoPagos(year);
        res.status(200).json(historico);
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
statsRouter.get('/cdmx/', getAllCdmx);
statsRouter.get('/actual/', getAllActual);
statsRouter.get('/save/', saveActual);
/*-------*/
// IMPORTANTE: Rutas específicas PRIMERO, rutas con parámetros DESPUÉS
// Reportes históricos (específicas)
statsRouter.get('/alumnos/historico', getHistoricoAlumnos);
statsRouter.get('/pagos/historico', getHistoricoPagos);
// Rutas con parámetros (genéricas)
statsRouter.get('/pagos/suma/total', getAlumnoPagosMes);
statsRouter.get('/pagos/suma/:campus', getAlumnoPagosMesCampus);
statsRouter.get('/pagos/falta/total', getAlumnoTotalFaltantes);
statsRouter.get('/pagos/falta/:campus', getAlumnoTotalfaltantesCampus);
statsRouter.get('/pagos/total/mensualidades', getAlumnoTotalMensualidades);
statsRouter.get('/pagos/total/mensualidades/:campus', getAlumnoTotalMensualidadesCampus);
statsRouter.get('/pagos/total/inscripciones', getAlumnoTotalInscripciones);
statsRouter.get('/pagos/total/inscripciones/:campus', getAlumnoTotalInscripcionesCampus);
statsRouter.get('/last/:campus', getLastThree);
statsRouter.get('/pagos/:id', getAllAlumnoPagos); // Esta debe ir AL FINAL

module.exports = {statsRouter, };