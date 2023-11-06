const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllStudent,findAllTeacher, findAllInstrumento, saveStudent, updateStudent, remove, saveTeacher, updateTeacher, saveUser, updateUser, findAllEncargado, findAllRecepcionista, activeStudents, updateStudentAsistencias, findAllStudentAsistencias, removeStudent} = require('./personal.gateway');

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

const getAllStudentAsistencias = async(req, res=Response)=>{
    try {
        const {id_alumno} = req.body;
        const personal = await findAllStudentAsistencias(id_alumno);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getActiveStudents = async(req, res=Response)=>{
    try {
        const personal = await activeStudents();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllEncargado = async(req, res=Response)=>{
    try {
        const personal = await findAllEncargado();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllRecepcionista = async(req, res=Response)=>{
    try {
        const personal = await findAllRecepcionista();
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
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases} = req.body;
        const person = await saveStudent({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases});
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualizeStudent = async (req, res = Response) => {
    console.log(req.body)
    try {
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases, user_id} = req.body;
       const person = await updateStudent({id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases, user_id})
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const actualizeStudentAsistencias = async (req, res = Response) => {
    try {
       const {id_alumno, dia1, dia2,dia3,dia4, dia5} = req.body;
       const person = await updateStudentAsistencias({id_alumno, dia1, dia2,dia3,dia4, dia5})
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const insertUser = async(req, res=Response)=>{
    try {
        console.log(req.body);
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,password} = req.body;
        const person = await saveUser({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role, password});
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualizeUser = async (req, res = Response) => {
    try {
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role} = req.body;
       const person = await updateUser({id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role})
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
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco, fecha_inicio, comprobante} = req.body;
        const person = await saveTeacher({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco,comprobante,fecha_inicio });
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualizeTeacher = async (req, res = Response) => {
    try {
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco,comprobante,fecha_inicio} = req.body;
       const person = await updateTeacher({id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco,comprobante,fecha_inicio})
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const eliminate = async (req, res = Response) => {
    try {
       const{ id, autor, accion } =req.body;
       const person = await remove(id, autor, accion);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

 const eliminateStudent = async (req, res = Response) => {
    try {
       const{ id, estado } =req.body;
       const person = await removeStudent(id, estado);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

const personalRouter = Router();

personalRouter.get('/', getAllStudent);
personalRouter.get('/alumno/activos', getActiveStudents);
personalRouter.post('/alumno/asistencias', getAllStudentAsistencias);
personalRouter.get('/teacher/', getAllTeacher);
personalRouter.get('/recepcionista/', getAllRecepcionista);
personalRouter.get('/encargado/', getAllEncargado);
personalRouter.post('/alumno/', insertStudent);
personalRouter.post('/user/', insertUser);
personalRouter.post('/teacher/', insertTeacher);
personalRouter.put('/alumno', actualizeStudent);
personalRouter.put('/alumno/asistencias', actualizeStudentAsistencias);
personalRouter.put('/teacher', actualizeTeacher);
personalRouter.put('/user', actualizeUser);
// personalRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
// personalRouter.post('/', insert);
// personalRouter.put('/', actualize);
personalRouter.delete('/',eliminate);
personalRouter.delete('/alumno/',eliminateStudent);

module.exports = {personalRouter, };