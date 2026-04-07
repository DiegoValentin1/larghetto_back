const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllByMaestro, findHorarioAllByMaestro, findAllByMaestroCampus, findAlumnosByClaseDetalle, findHistorialByMaestro} = require('./clase.gateway');
const { insertLog } = require('../stats/stats.gateway');

const getClasesByMaestro = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const promocion = await findAllByMaestro(id);
        console.log(promocion);
        res.status(200).json(promocion);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}


const getClasesByMaestroCampus = async(req, res=Response)=>{
    try {
        const {id, campus} = req.params;
        const promocion = await findAllByMaestroCampus(id, campus);
        console.log(promocion);
        res.status(200).json(promocion);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getHorarioByMaestro = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const promocion = await findHorarioAllByMaestro(id);
        console.log(promocion);
        res.status(200).json(promocion);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

// const getById = async(req, res=Response)=>{
//     try {
//         const {id} = req.params;
//         const person = await findById(id);
//         res.status(200).json(person);
//     } catch (error) {
//         console.log(error);
//         const message = validateError(error);
//         res.status(400).json({message});
//     }
// }

// const insert = async(req, res=Response)=>{
//     try {
//         const {promocion, descuento, empleado} = req.body;
//         await insertLog({empleado, accion:'Promoción añadida'});
//         console.log(promocion);
//         const promocionObj = await save({promocion, descuento});
//         res.status(200).json(promocionObj);
//     } catch (error) {
//         console.log(error);
//         const message = validateError(error);
//         res.status(400).json({message});
//     }
// }

// const actualize = async (req, res = Response) => {
//     try {
//        const { promocion, id, descuento, empleado} = req.body;
//        await insertLog({empleado, accion:'Promoción actualizada'});
//        const promocionObj = await update({
//           promocion,
//           descuento,
//           id
//        })
//        res.status(200).json(promocionObj);
//     } catch (error) {
//        console.log(error);
//        const message = validateError(error);
//        res.status(400).json({ message });
//     }
 
//  }

//  const eliminate = async (req, res = Response) => {
//     try {
//        const{ id } =req.params;
//        const {empleado} = req.body;
//        await insertLog({empleado, accion:'Promoción eliminada'});
//        const person = await remove(id);
//        res.status(200).json(person);
//     } catch (error) {
//        console.log(error);
//        const message = validateError(error);
//        res.status(400).json({ message });
//     }
//  }

const getAlumnosByClaseDetalle = async (req, res = Response) => {
    try {
        const { maestro_id } = req.params;
        const { dia, hora, instrumento, fecha } = req.query;
        if (!dia || !hora || !instrumento || !fecha) {
            return res.status(400).json({ message: 'Faltan parámetros: dia, hora, instrumento, fecha' });
        }
        const alumnos = await findAlumnosByClaseDetalle(maestro_id, dia, hora, instrumento, fecha);
        res.status(200).json(alumnos);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: validateError(error) });
    }
};

const getHistorialByMaestro = async (req, res = Response) => {
    try {
        const { maestro_id } = req.params;
        const limit = req.query.limit || 30;
        const historial = await findHistorialByMaestro(maestro_id, limit);
        res.status(200).json(historial);
    } catch (error) {
        console.log(error);
        res.status(400).json({ message: validateError(error) });
    }
};

const claseRouter = Router();

// Rutas específicas antes de las genéricas /:id para evitar conflictos
claseRouter.get('/alumnos/:maestro_id', getAlumnosByClaseDetalle);
claseRouter.get('/historial/:maestro_id', getHistorialByMaestro);
claseRouter.get('/maestro/:id/:campus', getClasesByMaestroCampus);
claseRouter.get('/maestro/:id', getHorarioByMaestro);
claseRouter.get('/:id', getClasesByMaestro);
// claseRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
// claseRouter.post('/', insert);
// claseRouter.put('/', actualize);
// claseRouter.delete('/:id',eliminate);

module.exports = {claseRouter, };