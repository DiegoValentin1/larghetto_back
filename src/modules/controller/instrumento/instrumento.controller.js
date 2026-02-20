const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllInstrumento, save, update, remove, findLastestLogs, findById, findAllInstrumentoMaestro, findAllInstrumento2, saveRepo, findAlumnosClasesCampus, findAlumnosClases, findLogsPaginados, findLogsRangoFechas} = require('./instrumento.gateway');
const { insertLog } = require('../stats/stats.gateway');



const enviarNoti = async(req, res=Response)=>{
    try {
        console.log('enviarNoti');
        sendNotification();
        res.status(200).send('Mensaje enviado');
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllInstrumento = async(req, res=Response)=>{
    try {
        const personal = await findAllInstrumento();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoClasesCampus = async(req, res=Response)=>{
    try {
        const {campus} = req.params;
        const personal = await findAlumnosClasesCampus(campus);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAlumnoClases = async(req, res=Response)=>{
    try {
        const personal = await findAlumnosClases();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllInstrumento2 = async(req, res=Response)=>{
    try {
        const personal = await findAllInstrumento2();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllInstrumentoMaestro = async(req, res=Response)=>{
    try {
        const personal = await findAllInstrumentoMaestro();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getLastestLogs = async(req, res=Response)=>{
    try {
        const { year } = req.query;
        const personal = await findLastestLogs(year);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getById = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const person = await findById(id);
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const insert = async(req, res=Response)=>{
    try {
        const {instrumento, empleado} = req.body;
        await insertLog({empleado, accion:'Instrumento añadido'});
        console.log(instrumento);
        const instrumentoObj = await save({instrumento});
        res.status(200).json(instrumentoObj);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const insertRepo = async(req, res=Response)=>{
    try {
        const {fecha, alumno_id, maestro_id, empleado} = req.body;
        await insertLog({empleado, accion:'Reposición añadida'});
        console.log(req.body);
        const instrumentoObj = await saveRepo({fecha, alumno_id, maestro_id});
        res.status(200).json(instrumentoObj);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualize = async (req, res = Response) => {
    try {
       const { instrumento, id, empleado} = req.body;
       await insertLog({empleado, accion:'Instrumento actualizado'});
       const instrumentoObj = await update({
          instrumento,
          id
       })
       res.status(200).json(instrumentoObj);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const eliminate = async (req, res = Response) => {
    try {
       const{ id } =req.params;
       const {empleado} = req.body;
       await insertLog({empleado, accion:'Instrumento eliminado'});
       const person = await remove(id);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

const getLogsPaginados = async(req, res=Response) => {
    try {
        const { fechaInicio, fechaFin, page = 1, limit = 100 } = req.query;
        const result = await findLogsPaginados({ fechaInicio, fechaFin, page, limit });
        res.status(200).json(result);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getLogsRangoFechas = async(req, res=Response) => {
    try {
        const rango = await findLogsRangoFechas();
        res.status(200).json(rango);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const instrumentoRouter = Router();

instrumentoRouter.get('/', getAllInstrumento);
instrumentoRouter.get('/noti', enviarNoti);
instrumentoRouter.get('/dos', getAllInstrumento2);
instrumentoRouter.get('/teacher', getAllInstrumentoMaestro);
instrumentoRouter.get('/lastest', getLastestLogs);
instrumentoRouter.get('/logs/paginados', [auth], getLogsPaginados);
instrumentoRouter.get('/logs/rango', [auth], getLogsRangoFechas);
instrumentoRouter.get('/:id', getById);
instrumentoRouter.post('/', insert);
instrumentoRouter.post('/repo', insertRepo);
instrumentoRouter.put('/', actualize);
instrumentoRouter.delete('/:id',eliminate);
instrumentoRouter.get('/clases/total/:campus', getAlumnoClasesCampus);
instrumentoRouter.get('/clases/total', getAlumnoClases);

module.exports = {instrumentoRouter, };