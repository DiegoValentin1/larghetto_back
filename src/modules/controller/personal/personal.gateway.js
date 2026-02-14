const { hashPassword } = require('../../../utils/functions');
const { query } = require('../../../utils/mysql');
const { calcularMensualidadReal } = require('../../../utils/promocion-helper');

const findAll = async () => {
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id`;
    return await query(sql, []);
}

const findAllStudentByMaestro = async (id) => {
    const sql = `SELECT pe.name FROM alumno_clases ac
    JOIN users us on us.id=ac.id_alumno
    JOIN personal pe on pe.id=us.personal_id
    JOIN alumno alu on alu.user_id=ac.id_alumno
    WHERE ac.id_maestro=? AND alu.estado!=0`;
    return await query(sql, [id]);
}

const findAllStudentRepo = async (id) => {
    const sql = `SELECT alr.id as id_repo, alr.fecha, pem.name
    FROM alumno_repo alr
    JOIN users us ON us.id = alr.alumno_id
    JOIN personal pe ON pe.id = us.personal_id
    JOIN users usm ON usm.id = alr.maestro_id
    JOIN personal pem ON pem.id = usm.personal_id
    WHERE MONTH(alr.fecha) >= MONTH(CURRENT_DATE()) AND YEAR(alr.fecha) >= YEAR(CURRENT_DATE()) AND alumno_id=?;`;
    return await query(sql, [id]);
}

const findAllTeacherRepo = async (id) => {
    const sql = `SELECT pe.name, alr.fecha
    FROM alumno_repo alr
    JOIN users us ON us.id = alr.alumno_id
    JOIN personal pe ON pe.id = us.personal_id
    WHERE MONTH(alr.fecha) >= MONTH(CURRENT_DATE()) AND YEAR(alr.fecha) >= YEAR(CURRENT_DATE()) AND maestro_id=?`;
    return await query(sql, [id]);
}

const findAllStatsByMaestro = async (id) => {
    const sql = `SELECT * FROM maestro_descuentos WHERE id_maestro=?`;
    const sql2 = `SELECT * FROM maestro_repo WHERE id_maestro=?`;
    const sql3 = `SELECT * FROM maestro_talleres WHERE id_maestro=?`;
    return [await query(sql, [id]), await query(sql2, [id]), await query(sql3, [id])];
}

const findAllRecepcionista = async () => {
    const sql = `SELECT pe.*, us.email, us.role,us.campus, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id WHERE us.role="RECEPCION"`;
    return await query(sql, []);
}

const findAllEncargado = async () => {
    const sql = `SELECT pe.*, us.email,us.campus, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id WHERE us.role="ENCARGADO"`;
    return await query(sql, []);
}

const findAllStudent = async () => {
    const sql = `SELECT pe.*,pe.id as personal_id, us.email, us.role, us.status, us.campus, us.id as id_user, al.*, promo.promocion, promo.descuento, al.id as alu_id
    FROM personal pe 
    join users us on us.personal_id=pe.id 
    join alumno al on al.user_id=us.id
    join promocion promo on promo.id=al.promocion_id
    WHERE us.role='ALUMNO'`;
    return await query(sql, []);
}

const findAllStudentCampus = async (campus) => {
    const sql = `SELECT pe.*,pe.id as personal_id, us.email, us.role, us.status, us.campus, us.id as id_user, al.*, promo.promocion, promo.descuento, al.id as alu_id
    FROM personal pe 
    join users us on us.personal_id=pe.id 
    join alumno al on al.user_id=us.id
    join promocion promo on promo.id=al.promocion_id
    WHERE us.role='ALUMNO' AND us.campus=?`;
    return await query(sql, [campus]);
}

const findAllStudentAsistencias = async (id) => {
    const sql = `SELECT * FROM alumno_asistencias WHERE id_alumno=?`;
    return await query(sql, [id]);
}

const findAllStudentClases = async (id) => {
    const sql = `SELECT ac.*, ins.instrumento, pe.name FROM alumno_clases ac
    join users us on us.id=ac.id_maestro AND us.role='MAESTRO'
    join personal pe on pe.id=us.personal_id
    join instrumento ins on ins.id=ac.id_instrumento WHERE ac.id_alumno=?`;
    return await query(sql, [id]);
}

const activeStudents = async () => {
    const sql = `SELECT count(us.id) as alumnosActivos from users us JOIN alumno alu on alu.user_id=us.id where us.role='ALUMNO' AND alu.estado!=0`;
    return await query(sql, []);
}

const findAllTeacher = async () => {
    const sql = `SELECT pe.*,us.campus, us.email, us.role, us.status , us.id as user_id, mae.*, pe.id as personal_id
    FROM personal pe 
    join users us on us.personal_id=pe.id
    join maestro mae on mae.user_id=us.id
    WHERE us.role='MAESTRO'`;
    return await query(sql, []);
}

const findAllTeacherByStatus = async () => {
    const sql = `SELECT pe.*,us.campus, us.email, us.role, us.status , us.id as user_id, mae.*, pe.id as personal_id
    FROM personal pe 
    join users us on us.personal_id=pe.id
    join maestro mae on mae.user_id=us.id
    WHERE us.role='MAESTRO' AND us.status=1`;
    return await query(sql, []);
}

const findAllInstrumento = async () => {
    const sql = `SELECT * FROM instrumento`;
    return await query(sql, []);
}



const findById = async (id) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error("Missing fields");
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id WHERE user_id=?`;

    return await query(sql, [id]);
}

const saveStudent = async (person) => {
    console.log(person);
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.nivel || !person.mensualidad || !person.promocion) throw Error("Missing fields");
    const nombres = person.name.toUpperCase().split(" ");
    var matricula;
    const cleanNames = nombres.filter(name => name.trim() !== "");

    let initials;
    if (cleanNames.length >= 2) {
        const lastNameIndex = cleanNames.length - 1;
        const secondLastNameIndex = cleanNames.length - 2;
        initials = removeAccents(cleanNames[secondLastNameIndex].substring(0, 1)) + removeAccents(cleanNames[lastNameIndex].substring(0, 1));
    } else if (cleanNames.length === 1) {
        initials = removeAccents(cleanNames[0].substring(0, 2));
    } else {
        throw new Error("Insufficient names to generate matricula");
    }

    const year = person.fechaNacimiento.substring(2, 4);
    const month = person.fechaNacimiento.substring(5, 7);
    const randomLetter = generateRandomLetter();
    matricula = `L${initials}${year}${month}${randomLetter}`;

    // NUEVO: fecha_inicio_promo = fecha_inicio del alumno
    const fechaInicioPromo = person.fechaInicio;

    const sql = `CALL InsertarPersonalUsuarioAlumno(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const respuesta = await query(sql, [person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.nivel, person.mensualidad, person.promocion, person.observaciones, matricula, person.campus, person.nombreMadre || 'N/A', person.nombrePadre || 'N/A', person.padreTelefono || 'N/A', person.madreTelefono || 'N/A', person.inscripcion, person.fechaInicio, fechaInicioPromo]);

    console.log(respuesta);

    await query(`DELETE FROM alumno_clases WHERE id_alumno=?`, [respuesta[0][0].usuarioInsertado])
    person.clases && await person.clases.forEach(async (element) => {
        await query(`INSERT INTO alumno_clases (id_alumno, id_maestro, id_instrumento, dia, hora) values(?,?,?,?,?)`, [respuesta[0][0].usuarioInsertado, element.maestro, element.instrumento, element.dia, element.hora])
    });

    return { ...person }
}

const saveUser = async (person) => {
    console.log(person);
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.password) throw Error("Missing fields");
    const sql = `CALL InsertarUsuario(?,?,?,?,?,?,?,?,?,?)`;
    const hashedPassword = await hashPassword(person.password);
    const { insertedId } = await query(sql, [person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, hashedPassword, person.role, person.campus]);

    return { ...person, id: insertedId }
}

const updateUser = async (person) => {
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!person.id) throw Error("Missing Fields");
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role) throw Error("Missing fields");
    const sql = `CALL ActualizarUser(?,?,?,?,?,?,?,?,?)`;
    const { insertedId } = await query(sql, [person.id, person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role]);
    return { ...person }
};

const updateStudent = async (person) => {
    console.log(person);
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!person.id) throw Error("Missing Fields");
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.nivel || !person.mensualidad || !person.promocion || !person.user_id) throw Error("Missing fields");
    await query(`DELETE FROM alumno_clases WHERE id_alumno=?`, [person.user_id])
    person.clases && await person.clases.forEach(async (element) => {
        await query(`INSERT INTO alumno_clases (id_alumno, id_maestro, id_instrumento, dia, hora) values(?,?,?,?,?)`, [person.user_id, element.maestro, element.instrumento, element.dia, element.hora])
    });
    await query(`DELETE FROM alumno_pagos WHERE alumno_id=?`, [person.user_id])

    // MODIFICADO: Obtener datos incluyendo duracion_meses y fecha_inicio_promo
    const alumnoData = await query(`
        SELECT
            a.mensualidad,
            a.promocion_id as promocion_id_anterior,
            a.fecha_inicio_promo,
            COALESCE(p.descuento, 0) as descuento,
            p.duracion_meses
        FROM alumno a
        LEFT JOIN promocion p ON p.id = a.promocion_id
        WHERE a.user_id = ?
    `, [person.user_id]);

    const mensualidad = alumnoData[0]?.mensualidad || 0;
    const descuento_promo = alumnoData[0]?.descuento || 0;
    const duracion_meses = alumnoData[0]?.duracion_meses || null;
    const fecha_inicio_promo_actual = alumnoData[0]?.fecha_inicio_promo || null;
    const promocion_id_anterior = alumnoData[0]?.promocion_id_anterior || null;

    // NUEVO: Si cambió la promoción, resetear fecha_inicio_promo
    let nueva_fecha_inicio_promo = fecha_inicio_promo_actual;
    if (promocion_id_anterior !== person.promocion) {
        nueva_fecha_inicio_promo = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    }

    // MODIFICADO: Usar helper para calcular mensualidad_real
    const mensualidad_real = calcularMensualidadReal({
        mensualidad: mensualidad,
        descuento_original: descuento_promo,
        duracion_meses: duracion_meses,
        fecha_inicio_promo: nueva_fecha_inicio_promo,
        fecha_referencia: new Date()
    });

    person.pagos && await person.pagos.forEach(async (element) => {
        // Calcular monto según tipo de pago
        let monto_registrado = mensualidad_real;
        if (element.tipo === 2) monto_registrado = mensualidad_real * 0.95; // Descuento 5%
        if (element.tipo === 3) monto_registrado = mensualidad_real * 1.10; // Recargo 10%

        await query(`INSERT INTO alumno_pagos (alumno_id, fecha, tipo, monto_registrado) values(?,?,?,?)`,
            [person.user_id, element.fecha, element.tipo, monto_registrado])
    });
    if (person.pagos.length > 0) {
        const fechaMasAlta = new Date(Math.max(...person.pagos.map(fecha => new Date(fecha.fecha).getTime())));
        fechaMasAlta.setHours(fechaMasAlta.getHours() + 12);
        await query(`CALL ActualizarProximoPago(?,?)`, [person.user_id, fechaMasAlta]);
    } else {
        const fechaActual = new Date(`${new Date().getFullYear()}-01-01T00:00:00`);
        fechaActual.setMonth(fechaActual.getMonth() - 1);
        await query(`CALL ActualizarProximoPago(?,?)`, [person.user_id, fechaActual]);
    }
    // MODIFICADO: Agregar nueva_fecha_inicio_promo como parámetro (24º)
    const sql = `CALL ActualizarPersonalUsuarioAlumno(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const { insertedId } = await query(sql, [person.id, person.name, person.fechaNacimiento.substring(0, 10), person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.nivel, person.mensualidad, person.instrumento, person.maestro, person.hora, person.dia, person.promocion, person.observaciones, person.nombreMadre, person.nombrePadre, person.padreTelefono, person.madreTelefono, person.fechaInicio, person.inscripcion, nueva_fecha_inicio_promo]);
    return { ...person }
};

const saveStudentAsistencias = async (person) => {
    console.log(person);
    if (Number.isNaN(person.id_alumno)) throw Error("Wrong Type");
    if (!person.id_alumno || !person.fecha || !person.id_clase) throw Error("Missing Fields");
    const sql = `INSERT INTO alumno_asistencias (id_alumno, fecha, id_clase) VALUES (?,?,?)`;
    const { insertedId } = await query(sql, [person.id_alumno, person.fecha, person.id_clase]);
    return { ...person }
};

const saveTeacher = async (person) => {
    console.log(person);
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.clabe || !person.cuenta || !person.banco || !person.fecha_inicio) throw Error("Missing fields");
    const sql = `CALL InsertarMaestro(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const respuesta = await query(sql, [person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.clabe, person.cuenta, person.banco, person.fecha_inicio, person.comprobante, person.campus]);

    await query(`DELETE FROM maestro_instrumento WHERE maestro_id=?`, [respuesta[0][0].usuarioInsertado])
    await person.maestroInstrumentos.forEach(async (element) => {
        await query(`INSERT INTO maestro_instrumento (maestro_id, instrumento_id) values(?,?)`, [respuesta[0][0].usuarioInsertado, element.instrumento_id])
    });

    return { ...person }
}

const updateTeacher = async (person) => {
    //Con esto se valida que id  sea un numero
    console.log(person)
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!person.id) throw Error("Missing Fields");
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.clabe || !person.cuenta || !person.fecha_inicio || !person.banco) throw Error("Missing fields");
    await query(`DELETE FROM maestro_clases WHERE id_maestro=?`, [person.user_id])
    person.clases && await person.clases.forEach(async (element) => {
        await query(`INSERT INTO maestro_clases (id_maestro, id_instrumento, dia, hora) values(?,?,?,?)`, [person.user_id, element.instrumento, element.dia, element.hora])
    });
    await query(`DELETE FROM maestro_instrumento WHERE maestro_id=?`, [person.user_id])
    await person.maestroInstrumentos.forEach(async (element) => {
        await query(`INSERT INTO maestro_instrumento (maestro_id, instrumento_id) values(?,?)`, [person.user_id, element.instrumento_id])
    });
    const sql = `CALL ActualizarMaestro(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const { insertedId } = await query(sql, [person.id, person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.clabe, person.cuenta, person.banco, person.fecha_inicio, person.comprobante]);
    return { ...person }
};

const updateTeacherStats = async (person) => {
    //Con esto se valida que id  sea un numero
    console.log(person)
    if (Number.isNaN(person.user_id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!person.user_id) throw Error("Missing Fields");

    await query(`DELETE FROM maestro_descuentos WHERE id_maestro=?`, [person.user_id])
    await person.descuentos.forEach(async (element) => {
        await query(`INSERT INTO maestro_descuentos (id_maestro, cantidad, comentario) values(?,?,?)`, [person.user_id, element.cantidad, element.comentario])
    });
    await query(`DELETE FROM maestro_repo WHERE id_maestro=?`, [person.user_id])
    await person.repos.forEach(async (element) => {
        await query(`INSERT INTO maestro_repo (id_maestro, cantidad, nombre) values(?,?,?)`, [person.user_id, element.cantidad, element.name])
    });
    await query(`DELETE FROM maestro_talleres WHERE id_maestro=?`, [person.user_id])
    await person.talleres.forEach(async (element) => {
        await query(`INSERT INTO maestro_talleres (id_maestro, cantidad, taller) values(?,?,?)`, [person.user_id, element.cantidad, element.taller])
    });
    return { ...person }
};

const remove = async (id) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE users SET status=IF(status = true, false, true) WHERE id=?`;
    // const sqlLog = `INSERT INTO logs (fecha, autor, accion) VALUES (CURRENT_TIMESTAMP, ?, ?)`;
    // await query(sqlLog,[autor, accion]);
    await query(sql, [id]);

    return { idDeleted: id };
}
const removeEmpleado = async (id) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    const sql1 = `SELECT personal_id FROM users WHERE id=?`;
    const sql2 = `DELETE FROM users WHERE id=?`;
    const sql3 = `DELETE FROM personal WHERE id=?`;
    const idPersonal = (await query(sql1, [id]))[0].personal_id;
    await query(sql2, [id]);
    await query(sql3, [idPersonal]);

    return { idDeleted: id, idPersonal: idPersonal };
}

const removeRepo = async (id) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    const sql = `DELETE FROM alumno_repo WHERE id=?`;
    await query(sql, [id]);

    return { idDeleted: id };
}

const removeStudent = async (id, estado) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE alumno SET estado=? WHERE id=?`;
    await query(sql, [estado, id]);

    return { idDeleted: id };
}

const removeStudentAsistencia = async (id_alumno, fecha, id_clase) => {
    if (Number.isNaN(id_alumno)) throw Error("Wrong Type");
    if (!id_alumno) throw Error('Missing Fields');
    const sql = `DELETE FROM alumno_asistencias WHERE id_alumno=? AND fecha=? AND id_clase=?`;
    await query(sql, [id_alumno, fecha, id_clase]);

    return { idDeleted: id_alumno };
}

const removeStudentPermanente = async (uid, pid) => {
    if (Number.isNaN(uid) || Number.isNaN(pid)) throw Error("Wrong Type");
    if (!uid || !pid) throw Error('Missing Fields');
    const sql = `CALL EliminarAlumno(?,?)`;
    await query(sql, [uid, pid]);

    return { idDeleted: uid };
}

const checkMatricula = async (matricula) => {
    if (!matricula) throw Error('Missing Fields');
    let nuevoStrnuevoStr = matricula.length === 6 ? matricula.substring(0, 2) + '%' + matricula.substring(2) : nuevoStr = matricula.substring(0, 2) + '%' + matricula.substring(3);
    console.log(nuevoStr);
    const sql = `select count(matricula) as conteo from alumno where matricula like ?`;
    const respuesta = await query(sql, [nuevoStr]);
    console.log(respuesta);
    return respuesta[0];
}


const generateRandomLetter = () => {
    const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude I, O, Q
    return letters.charAt(Math.floor(Math.random() * letters.length));
};

const removeAccents = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// ========================================
// FUNCIONES DE SOLICITUDES DE BAJA
// ========================================

const createSolicitudBaja = async ({alumno_id, solicitante_id, motivo}) => {
    if (Number.isNaN(alumno_id) || Number.isNaN(solicitante_id)) throw Error("Wrong Type");
    if (!alumno_id || !solicitante_id || !motivo) throw Error('Missing Fields');

    const sql = `INSERT INTO solicitudes_baja (alumno_id, solicitante_id, motivo) VALUES (?, ?, ?)`;
    const result = await query(sql, [alumno_id, solicitante_id, motivo]);

    return { id: result.insertId, alumno_id, solicitante_id, motivo };
};

const findSolicitudesBaja = async (estado, campus) => {
    let sql = `
        SELECT
            sb.id,
            sb.alumno_id,
            sb.solicitante_id,
            sb.fecha_solicitud,
            sb.estado,
            sb.motivo,
            sb.respuesta,
            sb.fecha_respuesta,
            sb.aprobador_id,
            pa.name as alumno_nombre,
            pa.id as alumno_personal_id,
            al.matricula,
            ps.name as solicitante_nombre,
            pap.name as aprobador_nombre,
            us.campus
        FROM solicitudes_baja sb
        JOIN users us ON us.id = sb.alumno_id
        JOIN personal pa ON pa.id = us.personal_id
        JOIN alumno al ON al.user_id = us.id
        JOIN personal ps ON ps.id = sb.solicitante_id
        LEFT JOIN users usa ON usa.id = sb.aprobador_id
        LEFT JOIN personal pap ON pap.id = usa.personal_id
    `;

    const conditions = [];
    const params = [];

    if (estado) {
        conditions.push('sb.estado = ?');
        params.push(estado);
    }

    if (campus) {
        conditions.push('us.campus = ?');
        params.push(campus);
    }

    if (conditions.length > 0) {
        sql += ' WHERE ' + conditions.join(' AND ');
    }

    sql += ' ORDER BY sb.fecha_solicitud DESC';

    const result = await query(sql, params);
    return result;
};

const aprobarSolicitudBaja = async ({solicitud_id, aprobador_id, respuesta}) => {
    if (Number.isNaN(solicitud_id) || Number.isNaN(aprobador_id)) throw Error("Wrong Type");
    if (!solicitud_id || !aprobador_id) throw Error('Missing Fields');

    // 1. Obtener el alumno_id de la solicitud
    const sqlGet = `SELECT alumno_id FROM solicitudes_baja WHERE id = ?`;
    const solicitud = await query(sqlGet, [solicitud_id]);

    if (!solicitud || solicitud.length === 0) throw Error('Solicitud no encontrada');

    const alumno_user_id = solicitud[0].alumno_id;

    // 2. Actualizar la solicitud a APROBADA
    const sqlUpdate = `
        UPDATE solicitudes_baja
        SET estado = 'APROBADA',
            respuesta = ?,
            fecha_respuesta = NOW(),
            aprobador_id = ?
        WHERE id = ?
    `;
    await query(sqlUpdate, [respuesta || 'Aprobado', aprobador_id, solicitud_id]);

    // 3. Obtener el id de la tabla alumno
    const sqlGetAlumnoId = `SELECT id FROM alumno WHERE user_id = ?`;
    const alumnoData = await query(sqlGetAlumnoId, [alumno_user_id]);

    if (!alumnoData || alumnoData.length === 0) throw Error('Alumno no encontrado');

    const alumno_id = alumnoData[0].id;

    // 4. IMPORTANTE: Inactivar al alumno (estado = 0)
    const sqlInactivar = `UPDATE alumno SET estado = 0 WHERE id = ?`;
    await query(sqlInactivar, [alumno_id]);

    return {
        solicitud_id,
        aprobador_id,
        alumno_id,
        message: 'Solicitud aprobada y alumno dado de baja'
    };
};

const rechazarSolicitudBaja = async ({solicitud_id, aprobador_id, respuesta}) => {
    if (Number.isNaN(solicitud_id) || Number.isNaN(aprobador_id)) throw Error("Wrong Type");
    if (!solicitud_id || !aprobador_id || !respuesta) throw Error('Missing Fields');

    const sql = `
        UPDATE solicitudes_baja
        SET estado = 'RECHAZADA',
            respuesta = ?,
            fecha_respuesta = NOW(),
            aprobador_id = ?
        WHERE id = ?
    `;
    await query(sql, [respuesta, aprobador_id, solicitud_id]);

    return { solicitud_id, aprobador_id, message: 'Solicitud rechazada' };
};

// ========================================
// ELIMINACIÓN SEGURA DE MAESTROS
// ========================================

const deleteMaestroSeguro = async (user_id) => {
    if (Number.isNaN(user_id)) throw Error("Wrong Type");
    if (!user_id) throw Error('Missing Fields');

    // PASO 1: Verificar dependencias (historial académico)
    const checks = [
        {
            query: 'SELECT COUNT(*) as count FROM alumno_clases WHERE id_maestro = ?',
            label: 'clases asignadas'
        },
        {
            query: 'SELECT COUNT(*) as count FROM maestro_repo WHERE id_maestro = ?',
            label: 'reposiciones registradas'
        },
        {
            query: 'SELECT COUNT(*) as count FROM alumno_repo WHERE maestro_id = ?',
            label: 'reposiciones de alumnos'
        },
        {
            query: 'SELECT COUNT(*) as count FROM maestro_descuentos WHERE id_maestro = ?',
            label: 'descuentos en nómina'
        },
        {
            query: 'SELECT COUNT(*) as count FROM maestro_talleres WHERE id_maestro = ?',
            label: 'talleres impartidos'
        }
    ];

    let totalRegistros = 0;
    const detalles = [];

    for (const check of checks) {
        const result = await query(check.query, [user_id]);
        const count = result[0].count;
        if (count > 0) {
            totalRegistros += count;
            detalles.push(`${count} ${check.label}`);
        }
    }

    // PASO 2: Decidir acción
    if (totalRegistros > 0) {
        // Tiene historial → Solo inactivar
        const sqlInactivar = `UPDATE users SET status = 0 WHERE id = ?`;
        await query(sqlInactivar, [user_id]);

        return {
            deleted: false,
            inactivated: true,
            message: `El maestro tiene historial académico (${detalles.join(', ')}). Se ha inactivado para preservar los datos.`,
            registros_historicos: totalRegistros,
            detalles: detalles
        };
    }

    // PASO 3: No tiene historial → Eliminar en cascada
    const sqlGetPersonal = `SELECT personal_id FROM users WHERE id = ?`;
    const personalResult = await query(sqlGetPersonal, [user_id]);

    if (!personalResult || personalResult.length === 0) throw Error('Maestro no encontrado');

    const personal_id = personalResult[0].personal_id;

    // Eliminar en orden de dependencias
    await query('DELETE FROM maestro_instrumento WHERE maestro_id = ?', [user_id]);
    await query('DELETE FROM maestro_clases WHERE id_maestro = ?', [user_id]);
    await query('DELETE FROM maestro WHERE user_id = ?', [user_id]);
    await query('DELETE FROM users WHERE id = ?', [user_id]);
    await query('DELETE FROM personal WHERE id = ?', [personal_id]);

    return {
        deleted: true,
        inactivated: false,
        message: 'Maestro eliminado permanentemente (no tenía historial académico)',
        idDeleted: user_id
    };
};

// Infinite scroll - Todos los campos necesarios para edición
const findAllStudentLazy = async (offset = 0, limit = 100, campus = null) => {
    const baseSql = `SELECT
                     al.id as alu_id,
                     al.matricula,
                     pe.name,
                     al.mensualidad,
                     al.inscripcion,
                     al.proximo_pago,
                     us.campus,
                     al.estado,
                     us.id as user_id,
                     promo.descuento,
                     al.fecha_inicio,
                     al.fecha_inicio_promo,
                     promo.duracion_meses,
                     promo.promocion,
                     al.promocion_id,
                     pe.id as personal_id,
                     us.email,
                     pe.fechaNacimiento,
                     al.nivel,
                     pe.domicilio,
                     pe.municipio,
                     pe.telefono,
                     pe.contactoEmergencia,
                     pe.observaciones,
                     al.nombreMadre,
                     al.nombrePadre,
                     al.madreTelefono,
                     al.padreTelefono
    FROM personal pe
    JOIN users us on us.personal_id=pe.id
    JOIN alumno al on al.user_id=us.id
    JOIN promocion promo on promo.id=al.promocion_id
    WHERE us.role='ALUMNO'`;

    const sql = campus ? `${baseSql} AND us.campus=? LIMIT ? OFFSET ?` : `${baseSql} LIMIT ? OFFSET ?`;
    const params = campus ? [campus, parseInt(limit), parseInt(offset)] : [parseInt(limit), parseInt(offset)];

    return await query(sql, params);
};

// Búsqueda en backend con todos los campos necesarios
const findAllStudentSearch = async (busqueda, offset = 0, limit = 100, campus = null) => {
    const baseSql = `SELECT
                     al.id as alu_id,
                     al.matricula,
                     pe.name,
                     al.mensualidad,
                     al.inscripcion,
                     al.proximo_pago,
                     us.campus,
                     al.estado,
                     us.id as user_id,
                     promo.descuento,
                     al.fecha_inicio,
                     al.fecha_inicio_promo,
                     promo.duracion_meses,
                     promo.promocion,
                     al.promocion_id,
                     pe.id as personal_id,
                     us.email,
                     pe.fechaNacimiento,
                     al.nivel,
                     pe.domicilio,
                     pe.municipio,
                     pe.telefono,
                     pe.contactoEmergencia,
                     pe.observaciones,
                     al.nombreMadre,
                     al.nombrePadre,
                     al.madreTelefono,
                     al.padreTelefono
    FROM personal pe
    JOIN users us on us.personal_id=pe.id
    JOIN alumno al on al.user_id=us.id
    JOIN promocion promo on promo.id=al.promocion_id
    WHERE us.role='ALUMNO' AND (al.matricula LIKE ? OR pe.name LIKE ?)`;

    const sql = campus ? `${baseSql} AND us.campus=? LIMIT ? OFFSET ?` : `${baseSql} LIMIT ? OFFSET ?`;
    const searchParam = `%${busqueda}%`;
    const params = campus ? [searchParam, searchParam, campus, parseInt(limit), parseInt(offset)] : [searchParam, searchParam, parseInt(limit), parseInt(offset)];

    return await query(sql, params);
};

// Conteo de alumnos por status para KPIs
const getStudentStatusCount = async (campus = null) => {
    const baseSql = `SELECT al.estado, COUNT(*) as count
    FROM personal pe
    JOIN users us on us.personal_id=pe.id
    JOIN alumno al on al.user_id=us.id
    WHERE us.role='ALUMNO'`;

    const sql = campus ? `${baseSql} AND us.campus=? GROUP BY al.estado` : `${baseSql} GROUP BY al.estado`;
    const params = campus ? [campus] : [];

    const result = await query(sql, params);

    // Convertir array a objeto {estado: count}
    const statusObj = {};
    result.forEach(row => {
        statusObj[row.estado] = row.count;
    });

    return statusObj;
};

module.exports = {
    findAllStudent,
    findAllTeacher,
    findAllInstrumento,
    saveStudent,
    updateStudent,
    remove,
    saveTeacher,
    updateTeacher,
    saveUser,
    updateUser,
    findAllEncargado,
    findAllRecepcionista,
    activeStudents,
    findAllStudentAsistencias,
    removeStudent,
    findAllStudentClases,
    removeStudentAsistencia,
    saveStudentAsistencias,
    findAllStudentByMaestro,
    updateTeacherStats,
    findAllStatsByMaestro,
    findAllStudentRepo,
    removeStudentPermanente,
    checkMatricula,
    findAllTeacherRepo,
    findAllStudentCampus,
    removeRepo,
    findAllStudentLazy,
    findAllStudentSearch,
    getStudentStatusCount,
    findAllTeacherByStatus,
    removeEmpleado,
    // Nuevas funciones de solicitudes de baja
    createSolicitudBaja,
    findSolicitudesBaja,
    aprobarSolicitudBaja,
    rechazarSolicitudBaja,
    // Eliminación segura de maestros
    deleteMaestroSeguro
};