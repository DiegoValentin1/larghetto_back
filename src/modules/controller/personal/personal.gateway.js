const { hashPassword } = require('../../../utils/functions');
const { query } = require('../../../utils/mysql');

const findAll = async () => {
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id`;
    return await query(sql, []);
}

const findAllStudentByMaestro = async (id) => {
    const sql = `SELECT pe.name FROM alumno_clases ac
    JOIN users us on us.id=ac.id_alumno
    JOIN personal pe on pe.id=us.personal_id WHERE ac.id_maestro=?`;
    return await query(sql, [id]);
}

const findAllStudentRepo = async (id) => {
    const sql = `SELECT * FROM alumno_repo WHERE alumno_id=?`;
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

const findAllStudentAsistencias = async (id) => {
    const sql = `SELECT * FROM alumno_asistencias WHERE id_alumno=?`;
    return await query(sql, [id]);
}

const findAllStudentClases = async (id) => {
    const sql = `SELECT ac.*, ins.instrumento, pe.name FROM alumno_clases ac
    join users us on us.id=ac.id_maestro
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
    var matricula
    if (nombres.length == 1) {
        matricula = `L${nombres[0].substring(0, 2)}${person.fechaNacimiento.substring(2, 4)}${person.fechaNacimiento.substring(5, 7)}`;
    } else if (nombres.length == 2) {
        matricula = `L${nombres[1].substring(0, 2)}${person.fechaNacimiento.substring(2, 4)}${person.fechaNacimiento.substring(5, 7)}`;
    } else if (nombres.length == 3) {
        matricula = `L${nombres[1].substring(0, 1)}${nombres[2].substring(0, 1)}${person.fechaNacimiento.substring(2, 4)}${person.fechaNacimiento.substring(5, 7)}`;
    } else if (nombres.length == 4) {
        matricula = `L${nombres[2].substring(0, 1)}${nombres[3].substring(0, 1)}${person.fechaNacimiento.substring(2, 4)}${person.fechaNacimiento.substring(5, 7)}`;
    } else if (nombres.length > 4) {
        matricula = `L${nombres[2].substring(0, 1)}${nombres[nombres.length - 1].substring(0, 1)}${person.fechaNacimiento.substring(2, 4)}${person.fechaNacimiento.substring(5, 7)}`;
    }

    const sql = `CALL InsertarPersonalUsuarioAlumno(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const respuesta = await query(sql, [person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.nivel, person.mensualidad, person.promocion, person.observaciones, matricula, person.nombreMadre || 'N/A', person.nombrePadre || 'N/A', person.padreTelefono || 'N/A', person.madreTelefono || 'N/A']);

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
    person.pagos && await person.pagos.forEach(async (element) => {
        await query(`INSERT INTO alumno_pagos (alumno_id, fecha) values(?,?)`, [person.user_id, element])
    });
    if (person.pagos.length > 0) {
        let fechaMasAlta = new Date(Math.max(...person.pagos.map(fecha => new Date(fecha).getTime())));
        fechaMasAlta.setHours(fechaMasAlta.getHours() + 12);
        await query(`CALL ActualizarProximoPago(?,?)`, [person.user_id, fechaMasAlta]);
    }
    const sql = `CALL ActualizarPersonalUsuarioAlumno(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const { insertedId } = await query(sql, [person.id, person.name, person.fechaNacimiento.substring(0, 10), person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.nivel, person.mensualidad, person.instrumento, person.maestro, person.hora, person.dia, person.promocion, person.observaciones, person.nombreMadre, person.nombrePadre, person.padreTelefono, person.madreTelefono]);
    return { ...person }
};

const saveStudentAsistencias = async (person) => {
    console.log(person);
    if (Number.isNaN(person.id_alumno)) throw Error("Wrong Type");
    if (!person.id_alumno || !person.fecha) throw Error("Missing Fields");
    const sql = `INSERT INTO alumno_asistencias (id_alumno, fecha) VALUES (?,?)`;
    const { insertedId } = await query(sql, [person.id_alumno, person.fecha]);
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

const removeStudent = async (id, estado) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE alumno SET estado=? WHERE id=?`;
    await query(sql, [estado, id]);

    return { idDeleted: id };
}

const removeStudentAsistencia = async (id_alumno, fecha) => {
    if (Number.isNaN(id_alumno)) throw Error("Wrong Type");
    if (!id_alumno) throw Error('Missing Fields');
    const sql = `DELETE FROM alumno_asistencias WHERE id_alumno=? AND fecha=?`;
    await query(sql, [id_alumno, fecha]);

    return { idDeleted: id_alumno };
}

module.exports = { findAllStudent, findAllTeacher, findAllInstrumento, saveStudent, updateStudent, remove, saveTeacher, updateTeacher, saveUser, updateUser, findAllEncargado, findAllRecepcionista, activeStudents, findAllStudentAsistencias, removeStudent, findAllStudentClases, removeStudentAsistencia, saveStudentAsistencias, findAllStudentByMaestro, updateTeacherStats, findAllStatsByMaestro, findAllStudentRepo };