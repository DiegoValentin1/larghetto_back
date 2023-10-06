const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllStudent,findAllTeacher, findAllInstrumento, saveStudent, updateStudent, remove, saveTeacher, updateTeacher} = require('./personal.gateway');

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

const insertStudent = async(req, res=Response)=>{
    try {
        console.log(req.body);
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,instrumento,maestro,hora,dia,promocion} = req.body;
        const person = await saveStudent({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,instrumento,maestro,hora,dia,promocion});
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualizeStudent = async (req, res = Response) => {
    try {
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,instrumento,maestro,hora,dia,promocion} = req.body;
       const person = await updateStudent({id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,instrumento,maestro,hora,dia,promocion})
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const insertTeacher = async(req, res=Response)=>{
    try {
        console.log(req.body);
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco} = req.body;
        const person = await saveTeacher({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco});
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualizeTeacher = async (req, res = Response) => {
    try {
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco} = req.body;
       const person = await updateTeacher({id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco})
       res.status(200).json(person);
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

const personalRouter = Router();

personalRouter.get('/', getAllStudent);
personalRouter.get('/teacher/', getAllTeacher);
personalRouter.post('/alumno/', insertStudent);
personalRouter.post('/teacher/', insertTeacher);
personalRouter.put('/alumno', actualizeStudent);
personalRouter.put('/teacher', actualizeTeacher);
// personalRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
// personalRouter.post('/', insert);
// personalRouter.put('/', actualize);
personalRouter.delete('/:id',eliminate);

module.exports = {personalRouter, };