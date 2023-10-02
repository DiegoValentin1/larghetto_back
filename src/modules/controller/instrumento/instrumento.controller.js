const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllInstrumento, save, update, remove} = require('./instrumento.gateway');

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
        const {instrumento} = req.body;
        console.log(instrumento);
        const instrumentoObj = await save({instrumento});
        res.status(200).json(instrumentoObj);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualize = async (req, res = Response) => {
    try {
       const { instrumento, id } = req.body;
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
       const person = await remove(id);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

const instrumentoRouter = Router();

instrumentoRouter.get('/', getAllInstrumento);
// instrumentoRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
instrumentoRouter.post('/', insert);
instrumentoRouter.put('/', actualize);
instrumentoRouter.delete('/:id',eliminate);

module.exports = {instrumentoRouter, };