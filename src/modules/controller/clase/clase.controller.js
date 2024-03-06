const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllByMaestro} = require('./clase.gateway');
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

const claseRouter = Router();

claseRouter.get('/:id', getClasesByMaestro);
// claseRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
// claseRouter.post('/', insert);
// claseRouter.put('/', actualize);
// claseRouter.delete('/:id',eliminate);

module.exports = {claseRouter, };