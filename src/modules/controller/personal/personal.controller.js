const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllStudent,findAllTeacher, findAllInstrumento/*, findById, save, update, remove*/} = require('./personal.gateway');

// const getAll = async(req, res=Response)=>{
//     try {
//         const personal = await findAll();
//         res.status(200).json(personal);
//     } catch (error) {
//         console.log(error);
//         const message = validateError(error);
//         res.status(400).json({message});
//     }
// }

const getAllStudent = async(req, res=Response)=>{
    try {
        const personal = await findAllStudent();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllTeacher = async(req, res=Response)=>{
    try {
        const personal = await findAllTeacher();
        res.status(200).json(personal);
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
//         const {name, lastname, birthday, salary, position} = req.body;
//         const person = await save({name, lastname, birthday, salary, position});
//         res.status(200).json(person);
//     } catch (error) {
//         console.log(error);
//         const message = validateError(error);
//         res.status(400).json({message});
//     }
// }

// const actualize = async (req, res = Response) => {
//     try {
//        const { name, empresa, role, email, id, user_id } = req.body;
//        const person = await update({
//           name,
//           empresa,
//           role,
//           email,
//           user_id,
//           id
//        })
//        res.status(200).json(person);
//     } catch (error) {
//        console.log(error);
//        const message = validateError(error);
//        res.status(400).json({ message });
//     }
 
//  }

//  const eliminate = async (req, res = Response) => {
//     try {
//        const{ id } =req.params;
//        const person = await remove(id);
//        res.status(200).json(person);
//     } catch (error) {
//        console.log(error);
//        const message = validateError(error);
//        res.status(400).json({ message });
//     }
//  }

const personalRouter = Router();

personalRouter.get('/', getAllStudent);
personalRouter.get('/teacher/', getAllTeacher);
// personalRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
// personalRouter.post('/', insert);
// personalRouter.put('/', actualize);
// personalRouter.delete('/:id',eliminate);

module.exports = {personalRouter, };