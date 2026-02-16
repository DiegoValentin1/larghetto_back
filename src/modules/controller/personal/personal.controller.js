const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const {validateError} = require('../../../utils/functions');
const {findAllStudent,findAllTeacher, findAllTeacherArchived, findAllInstrumento, saveStudent, updateStudent, remove, saveTeacher, updateTeacher, saveUser, updateUser, findAllEncargado, findAllRecepcionista, activeStudents, findAllStudentAsistencias, removeStudent, findAllStudentClases, removeStudentAsistencia, saveStudentAsistencias, findAllStudentByMaestro, updateTeacherStats, findAllStatsByMaestro, findAllStudentRepo, removeStudentPermanente, checkMatricula, findAllTeacherRepo, findAllStudentCampus, removeRepo, findAllTeacherByStatus, removeEmpleado, createSolicitudBaja, findSolicitudesBaja, aprobarSolicitudBaja, rechazarSolicitudBaja, deleteMaestroSeguro, findAllStudentLazy, findAllStudentSearch, getStudentStatusCount} = require('./personal.gateway');
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

const getAllTeacherByStatus = async(req, res=Response)=>{
    try {
        const personal = await findAllTeacherByStatus();
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const getAllTeacherArchived = async(req, res=Response)=>{
    try {
        const {campus} = req.query;
        const personal = await findAllTeacherArchived(campus);
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
 const eliminateEmpleado = async (req, res = Response) => {
    try {
       const{id} =req.params;
       const {empleado} = req.body;
       await insertLog({empleado, accion:'Usuario eliminado'});
       const person = await removeEmpleado(id);
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

       // Validación: RECEPCION no puede cambiar directamente a estado 0 (Bajo)
       // Debe usar el sistema de solicitudes de baja
       if (req.token && req.token.role === 'RECEPCION' && estado === 0) {
          return res.status(403).json({
             message: 'Los recepcionistas deben usar el sistema de solicitudes para dar de baja alumnos'
          });
       }

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

// ========================================
// CONTROLADORES DE SOLICITUDES DE BAJA
// ========================================

const solicitarBajaAlumno = async (req, res = Response) => {
   try {
      const {alumno_id, motivo, empleado} = req.body;
      const solicitante_id = req.token.id; // ID del usuario autenticado

      await insertLog({empleado, accion: `Solicitud de baja para alumno ID ${alumno_id}`});

      const solicitud = await createSolicitudBaja({alumno_id, solicitante_id, motivo});
      res.status(201).json(solicitud);
   } catch (error) {
      console.log(error);
      const message = validateError(error);
      res.status(400).json({message});
   }
}

const getSolicitudesBaja = async (req, res = Response) => {
   try {
      const {estado, campus} = req.query;
      const solicitudes = await findSolicitudesBaja(estado, campus);
      res.status(200).json(solicitudes);
   } catch (error) {
      console.log(error);
      const message = validateError(error);
      res.status(400).json({message});
   }
}

const aprobarSolicitud = async (req, res = Response) => {
   try {
      const {id} = req.params;
      const {respuesta, empleado} = req.body;
      const aprobador_id = req.token.id; // ID del SUPER que aprueba

      await insertLog({empleado, accion: `Solicitud de baja ${id} aprobada`});

      const result = await aprobarSolicitudBaja({
         solicitud_id: parseInt(id),
         aprobador_id,
         respuesta
      });

      res.status(200).json(result);
   } catch (error) {
      console.log(error);
      const message = validateError(error);
      res.status(400).json({message});
   }
}

const rechazarSolicitud = async (req, res = Response) => {
   try {
      const {id} = req.params;
      const {respuesta, empleado} = req.body;
      const aprobador_id = req.token.id;

      await insertLog({empleado, accion: `Solicitud de baja ${id} rechazada`});

      const result = await rechazarSolicitudBaja({
         solicitud_id: parseInt(id),
         aprobador_id,
         respuesta
      });

      res.status(200).json(result);
   } catch (error) {
      console.log(error);
      const message = validateError(error);
      res.status(400).json({message});
   }
}

// ========================================
// ELIMINACIÓN SEGURA DE MAESTROS
// ========================================

const deleteMaestroPermanente = async (req, res = Response) => {
   try {
      const {id} = req.params;
      const {empleado} = req.body;

      const result = await deleteMaestroSeguro(parseInt(id));

      if (result.archived) {
         const detalleLog = result.registros_historicos > 0
             ? `Maestro archivado (${result.registros_historicos} registros históricos)`
             : 'Maestro archivado (sin historial)';
         await insertLog({empleado, accion: detalleLog});
      }

      res.status(200).json(result);
   } catch (error) {
      console.log(error);
      const message = validateError(error);
      res.status(400).json({message});
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
personalRouter.get('/teacher/active', getAllTeacherByStatus);
personalRouter.get('/teacher/archived', [auth, checkRoles(['SUPER', 'ENCARGADO'])], getAllTeacherArchived);
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
personalRouter.delete('/empleado/:id',eliminateEmpleado);
personalRouter.delete('/repo/:id',eliminateRepo);
personalRouter.delete('/alumno/:uid/:pid',eliminateStudentPermanente);
personalRouter.put('/alumno/eliminar',[auth, checkRoles(['SUPER', 'ENCARGADO', 'RECEPCION'])],eliminateStudent);
personalRouter.delete('/alumno/asistencias/:id_alumno/:fecha/:id_clase',eliminateStudentAsistencias);

// Rutas de solicitudes de baja
personalRouter.post('/alumno/solicitar-baja', [auth, checkRoles(['RECEPCION', 'ENCARGADO'])], solicitarBajaAlumno);
personalRouter.get('/solicitudes-baja', [auth, checkRoles(['SUPER', 'ENCARGADO'])], getSolicitudesBaja);
personalRouter.put('/solicitudes-baja/:id/aprobar', [auth, checkRoles(['SUPER'])], aprobarSolicitud);
personalRouter.put('/solicitudes-baja/:id/rechazar', [auth, checkRoles(['SUPER'])], rechazarSolicitud);

// Ruta de eliminación segura de maestros
personalRouter.delete('/teacher/permanente/:id', [auth, checkRoles(['SUPER'])], deleteMaestroPermanente);

// Infinite scroll - Lazy loading de alumnos
const getAllStudentLazy = async(req, res=Response)=>{
    try {
        const { offset = 0, limit = 100, campus } = req.query;
        const personal = await findAllStudentLazy(offset, limit, campus || null);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

// Búsqueda de alumnos en backend
const getAllStudentSearch = async(req, res=Response)=>{
    try {
        const { q, offset = 0, limit = 100, campus } = req.query;
        if (!q) {
            return res.status(400).json({message: 'Query parameter required'});
        }
        const personal = await findAllStudentSearch(q, offset, limit, campus || null);
        res.status(200).json(personal);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

// Conteo de alumnos por status
const getStatusCount = async(req, res=Response)=>{
    try {
        const { campus } = req.query;
        const statusCount = await getStudentStatusCount(campus || null);
        res.status(200).json(statusCount);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

personalRouter.get('/lazy', getAllStudentLazy);
personalRouter.get('/search', getAllStudentSearch);
personalRouter.get('/status-count', getStatusCount);

module.exports = {personalRouter, };