const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllPromocion, save, update, remove, deleteFisicaPromocion} = require('./promocion.gateway');
const { insertLog } = require('../stats/stats.gateway');

const getAllPromocion = async(req, res=Response)=>{
    try {
        const promocion = await findAllPromocion();
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

const insert = async(req, res=Response)=>{
    try {
        const {promocion, descuento, fecha_inicio, fecha_fin, empleado} = req.body;
        await insertLog({empleado, accion:'Promoción añadida'});
        console.log(promocion);
        const promocionObj = await save({promocion, descuento, fecha_inicio, fecha_fin});
        res.status(200).json(promocionObj);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualize = async (req, res = Response) => {
    try {
       const { promocion, id, descuento, fecha_inicio, fecha_fin, empleado} = req.body;
       await insertLog({empleado, accion:'Promoción actualizada'});
       const promocionObj = await update({
          promocion,
          descuento,
          fecha_inicio,
          fecha_fin,
          id
       })
       res.status(200).json(promocionObj);
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
       await insertLog({empleado, accion:'Promoción eliminada'});
       const person = await remove(id);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

 const deletePermanente = async (req, res = Response) => {
    try {
       const {id} = req.params;
       const {empleado} = req.body;

       const result = await deleteFisicaPromocion(parseInt(id));

       if (result.deleted) {
          await insertLog({empleado, accion: 'Promoción eliminada permanentemente'});
       } else {
          await insertLog({empleado, accion: `Promoción inactivada (tenía ${result.alumnos_afectados} alumnos)`});
       }

       res.status(200).json(result);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({message});
    }
 }

const promocionRouter = Router();

promocionRouter.get('/', getAllPromocion);
// promocionRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
promocionRouter.post('/', insert);
promocionRouter.put('/', actualize);
promocionRouter.delete('/:id',eliminate);
promocionRouter.delete('/permanente/:id', [auth, checkRoles(['SUPER'])], deletePermanente);

module.exports = {promocionRouter, };