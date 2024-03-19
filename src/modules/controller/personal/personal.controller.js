const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllStudent,findAllTeacher, findAllInstrumento, saveStudent, updateStudent, remove, saveTeacher, updateTeacher, saveUser, updateUser, findAllEncargado, findAllRecepcionista, activeStudents, findAllStudentAsistencias, removeStudent, findAllStudentClases, removeStudentAsistencia, saveStudentAsistencias, findAllStudentByMaestro, updateTeacherStats, findAllStatsByMaestro, findAllStudentRepo, removeStudentPermanente, checkMatricula, findAllTeacherRepo, findAllStudentCampus, removeRepo} = require('./personal.gateway');
const { insertLog } = require('../stats/stats.gateway');

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

const getAllStudentByMaestro = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const personal = await findAllStudentByMaestro(id);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllStudentRepo = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const personal = await findAllStudentRepo(id);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllTeacherRepo = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        console.log("idteacher", id)
        const personal = await findAllTeacherRepo(id);
        console.log(personal);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllStatsByMaestro = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const personal = await findAllStatsByMaestro(id);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

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

const getAllStudentCampus = async(req, res=Response)=>{
    try {
        const {campus} = req.params;
        const personal = await findAllStudentCampus(campus);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllStudentAsistencias = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const personal = await findAllStudentAsistencias(id);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllStudentClases = async(req, res=Response)=>{
    try {
        const {id} = req.params;
        const personal = await findAllStudentClases(id);
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
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases, nombreMadre, nombrePadre, padreTelefono, madreTelefono, campus, empleado, inscripcion, fechaInicio} = req.body;
        await insertLog({empleado, accion:'Estudiante añadido'});
        const person = await saveStudent({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases, nombreMadre, nombrePadre, padreTelefono, madreTelefono, campus, inscripcion, fechaInicio});
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
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases, user_id, nombreMadre, nombrePadre, padreTelefono, madreTelefono, pagos, empleado, inscripcion, fechaInicio} = req.body;
       await insertLog({empleado, accion:'Estudiante modificado'});
       const person = await updateStudent({id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,nivel,mensualidad,promocion, observaciones, clases, user_id, nombreMadre, nombrePadre, padreTelefono, madreTelefono, pagos, inscripcion, fechaInicio})
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const insertStudentAsistencias = async (req, res = Response) => {
    try {
       const {id_alumno, fecha, empleado, id_clase} = req.body;
       await insertLog({empleado, accion:'Asistencia Añadida'});
       const person = await saveStudentAsistencias({id_alumno, fecha, id_clase})
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
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,password, campus, empleado} = req.body;
        await insertLog({empleado, accion:'Estudiante añadido'});
        const person = await saveUser({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role, password, campus});
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualizeUser = async (req, res = Response) => {
    try {
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role, empleado} = req.body;
       await insertLog({empleado, accion:'Estudiante actualizado'});
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
        const {name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco, fecha_inicio, comprobante, maestroInstrumentos, campus, empleado} = req.body;
        await insertLog({empleado, accion:'Maestro modificado'});
        const person = await saveTeacher({name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco,comprobante,fecha_inicio, maestroInstrumentos, campus});
        res.status(200).json(person);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const actualizeTeacher = async (req, res = Response) => {
    try {
        console.log(req.body);
       const {id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco,comprobante,fecha_inicio, maestroInstrumentos, user_id, empleado, clases} = req.body;
       await insertLog({empleado, accion:'Maestro modificado'});
       const person = await updateTeacher({id, name, fechaNacimiento,domicilio,municipio, telefono,contactoEmergencia,email,role,clabe,cuenta,banco,comprobante,fecha_inicio, maestroInstrumentos, user_id, clases})
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const actualizeTeacherStats = async (req, res = Response) => {
    try {
        console.log(req.body);
       const {user_id, descuentos, repos, talleres, empleado} = req.body;
       await insertLog({empleado, accion:'Maestro nomina modificada'});
       const person = await updateTeacherStats({user_id, descuentos, repos, talleres})
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 
 }

 const eliminate = async (req, res = Response) => {
    try {
       const{id} =req.params;
       const {empleado} = req.body;
       await insertLog({empleado, accion:'Usuario cambio status'});
       const person = await remove(id);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

 const eliminateRepo = async (req, res = Response) => {
    try {
       const{id} =req.params;
       const {empleado} = req.body;
       await insertLog({empleado, accion:'Eliminó Reposición'});
       const person = await removeRepo(id);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

 const eliminateStudent = async (req, res = Response) => {
    try {
       const{ id, estado, empleado } =req.body;
       await insertLog({empleado, accion:'Estudiante estatus modificado'});
       const person = await removeStudent(id, estado);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

 const eliminateStudentAsistencias = async (req, res = Response) => {
    try {
       const{id_alumno, fecha, id_clase} =req.params;
       const {empleado} = req.body;
       await insertLog({empleado, accion:'Estudiante asistencia eliminada'});
       const person = await removeStudentAsistencia(id_alumno, fecha, id_clase);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

 const eliminateStudentPermanente = async (req, res = Response) => {
    try {
       const{uid, pid} =req.params;
       const {empleado} = req.body;
       await insertLog({empleado, accion:'Estudiante Eliminado Permanentemente'});
       const person = await removeStudentPermanente(uid, pid);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

 const matriculaExists = async (req, res = Response) => {
    try {
       const{matricula} =req.params;
       const person = await checkMatricula(matricula);
       res.status(200).json(person);
    } catch (error) {
       console.log(error);
       const message = validateError(error);
       res.status(400).json({ message });
    }
 }

const personalRouter = Router();

personalRouter.get('/', getAllStudent);
personalRouter.get('/getalumno/:campus', getAllStudentCampus);
personalRouter.get('/alumno/activos', getActiveStudents);
personalRouter.get('/alumno/asistencias/:id', getAllStudentAsistencias);
personalRouter.get('/alumno/repo/:id', getAllStudentRepo);
personalRouter.get('/teacher/repo/:id', getAllTeacherRepo);
personalRouter.get('/alumno/clases/:id', getAllStudentByMaestro);
personalRouter.get('/teacher/stats/:id', getAllStatsByMaestro);
personalRouter.get('/teacher/', getAllTeacher);
personalRouter.get('/clases/:id', getAllStudentClases);
personalRouter.get('/matricula/check/:matricula', matriculaExists);
personalRouter.get('/recepcionista/', getAllRecepcionista);
personalRouter.get('/encargado/', getAllEncargado);
personalRouter.post('/alumno/asistencias', insertStudentAsistencias);
personalRouter.post('/alumno/', insertStudent);
personalRouter.post('/user/', insertUser);
personalRouter.post('/teacher/', insertTeacher);
personalRouter.put('/alumno', actualizeStudent);
personalRouter.put('/alumno/asistencias', insertStudentAsistencias);
personalRouter.put('/teacher', actualizeTeacher);
personalRouter.put('/teacher/stats', actualizeTeacherStats);
personalRouter.put('/user', actualizeUser);
// personalRouter.get('/:id',[auth, checkRoles(['ADMIN'])], getById);
// personalRouter.post('/', insert);
// personalRouter.put('/', actualize);
personalRouter.delete('/:id',eliminate);
personalRouter.delete('/repo/:id',eliminateRepo);
personalRouter.delete('/alumno/:uid/:pid',eliminateStudentPermanente);
personalRouter.put('/alumno/eliminar',eliminateStudent);
personalRouter.delete('/alumno/asistencias/:id_alumno/:fecha/:id_clase',eliminateStudentAsistencias);

module.exports = {personalRouter, };