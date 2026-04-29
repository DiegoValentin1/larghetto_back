const { hashPassword } = require('../../../utils/functions');
const { query, getConnection } = require('../../../utils/mysql');
const { calcularMensualidadReal } = require('../../../utils/promocion-helper');
const auditLog = require('../../../utils/auditLog');
const snapshotReader = require('../../../utils/snapshotReader');
const { RECARGO_PORCENTAJE, DESCUENTO_PORCENTAJE, DIA_LIMITE_PAGO } = require('../../../config/pagos.config');

const formatFechaLegible = (fechaStr) => {
    if (!fechaStr) return String(fechaStr);
    const [y, m, d] = String(fechaStr).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long' }).format(date);
};

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
    WHERE us.role='MAESTRO' AND us.status=1`;
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

const findAllTeacherArchived = async (campus = null) => {
    const baseSql = `SELECT pe.*,us.campus, us.email, us.role, us.status , us.id as user_id, mae.*, pe.id as personal_id
    FROM personal pe
    join users us on us.personal_id=pe.id
    join maestro mae on mae.user_id=us.id
    WHERE us.role='MAESTRO' AND us.status=0`;

    const sql = campus ? `${baseSql} AND us.campus=?` : baseSql;
    const params = campus ? [campus] : [];

    return await query(sql, params);
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

const saveStudent = async (person, userData = {}) => {
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
    const clasesValidas = (person.clases || []).filter(e => e.maestro && e.instrumento && e.dia && e.hora);
    for (const element of clasesValidas) {
        await query(`INSERT INTO alumno_clases (id_alumno, id_maestro, id_instrumento, dia, hora) values(?,?,?,?,?)`, [respuesta[0][0].usuarioInsertado, element.maestro, element.instrumento, element.dia, element.hora]);
    }

    if (userData && userData.id) {
        const newUserId = respuesta[0][0].usuarioInsertado;
        await auditLog.register({
            entityType: 'ALUMNO',
            entityId: newUserId,
            entityName: `${person.name} (${matricula})`,
            actionType: 'CREATE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: person.campus || userData.campus,
            summary: `${userData.name || userData.email} creó alumno: ${person.name} (${matricula})`,
            oldValue: null,
            newValue: { name: person.name, email: person.email, campus: person.campus, mensualidad: person.mensualidad, nivel: person.nivel }
        });
    }

    return { ...person }
}

const checkEmailStaff = async (email) => {
    const result = await query(
        `SELECT id FROM users WHERE email=? AND role IN ('ENCARGADO', 'RECEPCION') LIMIT 1`,
        [email]
    );
    return result.length > 0;
}

const checkEmailStaffExcluding = async (email, personalId) => {
    const result = await query(
        `SELECT u.id FROM users u WHERE u.email=? AND u.role IN ('ENCARGADO', 'RECEPCION') AND u.personal_id != ? LIMIT 1`,
        [email, personalId]
    );
    return result.length > 0;
}

const saveUser = async (person, userData = {}) => {
    console.log(person);
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.password) throw Error("Missing fields");
    const sql = `CALL InsertarUsuario(?,?,?,?,?,?,?,?,?,?)`;
    const hashedPassword = await hashPassword(person.password);
    const { insertedId } = await query(sql, [person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, hashedPassword, person.role, person.campus]);

    if (userData && userData.id) {
        // Obtener el ID real del usuario recién creado
        const newUserRows = await query(`SELECT id FROM users WHERE email = ? ORDER BY id DESC LIMIT 1`, [person.email]);
        const newEntityId = (newUserRows && newUserRows[0]) ? newUserRows[0].id : 0;
        await auditLog.register({
            entityType: 'PERSONAL',
            entityId: newEntityId,
            entityName: person.name,
            actionType: 'CREATE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: person.campus || userData.campus,
            summary: `${userData.name || userData.email} creó ${person.role}: ${person.name}`,
            oldValue: null,
            newValue: { name: person.name, email: person.email, role: person.role, campus: person.campus }
        });
    }

    return { ...person, id: insertedId }
}

const updateUser = async (person, userData = {}) => {
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio
    if (!person.id) throw Error("Missing Fields");
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role) throw Error("Missing fields");

    const oldSnapshot = (userData && userData.id) ? await snapshotReader.getPersonalSnapshot(person.id) : null;

    const sql = `CALL ActualizarUser(?,?,?,?,?,?,?,?,?)`;
    const { insertedId } = await query(sql, [person.id, person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role]);
    if (person.campus) {
        await query(`UPDATE users SET campus=? WHERE personal_id=?`, [person.campus, person.id]);
    }

    if (userData && userData.id) {
        const { oldFields, newFields } = snapshotReader.getDiff(oldSnapshot, {
            name: person.name, email: person.email, role: person.role, campus: person.campus,
            telefono: person.telefono, domicilio: person.domicilio, municipio: person.municipio
        });
        await auditLog.register({
            entityType: 'PERSONAL',
            entityId: person.id,
            entityName: (oldSnapshot && oldSnapshot.name) || person.name,
            actionType: 'UPDATE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: person.campus || (oldSnapshot && oldSnapshot.campus) || userData.campus,
            summary: `${userData.name || userData.email} actualizó ${person.role}: ${person.name}`,
            oldValue: Object.keys(oldFields || {}).length > 0 ? oldFields : oldSnapshot,
            newValue: Object.keys(newFields || {}).length > 0 ? newFields : { name: person.name, email: person.email, campus: person.campus }
        });
    }

    return { ...person }
};

const updateStudent = async (person, userData = {}) => {
    console.log(person);
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio
    if (!person.id) throw Error("Missing Fields");
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.nivel || !person.mensualidad || !person.promocion || !person.user_id) throw Error("Missing fields");

    // SNAPSHOT: leer ANTES del DELETE+INSERT para preservar estado anterior
    const oldSnapshot = (userData && userData.id) ? await snapshotReader.getAlumnoSnapshot(person.user_id) : null;

    // Capturar IDs viejos antes de borrar para poder migrar asistencias
    const clasesViejas = await query(`SELECT id, id_maestro, id_instrumento FROM alumno_clases WHERE id_alumno=?`, [person.user_id]);
    const claseViejaMap = {};
    for (const c of clasesViejas) {
        claseViejaMap[`${c.id_maestro}_${c.id_instrumento}`] = c.id;
    }

    await query(`DELETE FROM alumno_clases WHERE id_alumno=?`, [person.user_id])
    const clasesValidas = (person.clases || []).filter(e => e.maestro && e.instrumento && e.dia && e.hora);
    for (const element of clasesValidas) {
        const { insertId } = await query(
            `INSERT INTO alumno_clases (id_alumno, id_maestro, id_instrumento, dia, hora) values(?,?,?,?,?)`,
            [person.user_id, element.maestro, element.instrumento, element.dia, element.hora]
        );
        // Migrar asistencias del id_clase viejo al nuevo (mismo maestro + instrumento)
        const viejoId = claseViejaMap[`${element.maestro}_${element.instrumento}`];
        if (viejoId && insertId) {
            await query(`UPDATE alumno_asistencias SET id_clase = ? WHERE id_clase = ?`, [insertId, viejoId]);
        }
    }
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

    // TRANSACCIÓN: DELETE + INSERT de alumno_pagos en una sola conexión atómica
    const newPagosConMonto = [];
    const conn = await getConnection();
    const connQuery = (sql, params) => new Promise((resolve, reject) => {
        conn.query(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
    try {
        await connQuery('START TRANSACTION', []);
        await connQuery(`DELETE FROM alumno_pagos WHERE alumno_id=?`, [person.user_id]);
        if (person.pagos && person.pagos.length > 0) {
            for (const element of person.pagos) {
                let monto_registrado = mensualidad_real;
                if (element.tipo === 2) monto_registrado = mensualidad_real * (1 - DESCUENTO_PORCENTAJE); // Descuento 5%
                if (element.tipo === 3) monto_registrado = mensualidad_real * (1 + RECARGO_PORCENTAJE); // Recargo 10%
                if (element.tipo === 4) monto_registrado = mensualidad_real * 0.25; // Equivalencia 25%
                if (element.tipo === 5) monto_registrado = mensualidad_real * 0.50; // Equivalencia 50%
                if (element.tipo === 6) monto_registrado = mensualidad_real * 0.75; // Equivalencia 75%
                await connQuery(`INSERT INTO alumno_pagos (alumno_id, fecha, tipo, monto_registrado) values(?,?,?,?)`,
                    [person.user_id, element.fecha, element.tipo, monto_registrado]);
                newPagosConMonto.push({ fecha: element.fecha, tipo: element.tipo, monto_registrado });
            }
            const fechaMasAlta = new Date(Math.max(...person.pagos.map(p => new Date(p.fecha).getTime())));
            fechaMasAlta.setHours(fechaMasAlta.getHours() + 12);
            await connQuery(`CALL ActualizarProximoPago(?,?)`, [person.user_id, fechaMasAlta]);
        } else {
            const fechaActual = new Date(`${new Date().getFullYear()}-01-01T00:00:00`);
            fechaActual.setMonth(fechaActual.getMonth() - 1);
            await connQuery(`CALL ActualizarProximoPago(?,?)`, [person.user_id, fechaActual]);
        }
        await connQuery('COMMIT', []);
    } catch (e) {
        await connQuery('ROLLBACK', []);
        conn.release();
        throw e;
    }
    conn.release();
    // MODIFICADO: Agregar nueva_fecha_inicio_promo como parámetro (24º)
    const sql = `CALL ActualizarPersonalUsuarioAlumno(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const { insertedId } = await query(sql, [person.id, person.name, person.fechaNacimiento.substring(0, 10), person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.nivel, person.mensualidad, person.instrumento, person.maestro, person.hora, person.dia, person.promocion, person.observaciones, person.nombreMadre, person.nombrePadre, person.madreTelefono, person.padreTelefono, person.fechaInicio, person.inscripcion, nueva_fecha_inicio_promo]);

    if (userData && userData.id && oldSnapshot) {
        const entityNameStr = oldSnapshot.matricula ? `${person.name} (${oldSnapshot.matricula})` : person.name;

        // 1. Diff solo de campos de datos del alumno (whitelist — sin pagos, clases, ni campos de sistema)
        const { oldFields, newFields } = snapshotReader.getStudentDataDiff(oldSnapshot, {
            name: person.name,
            fechaNacimiento: person.fechaNacimiento,
            domicilio: person.domicilio,
            municipio: person.municipio,
            telefono: person.telefono,
            contactoEmergencia: person.contactoEmergencia,
            email: person.email,
            nivel: person.nivel,
            mensualidad: person.mensualidad,
            observaciones: person.observaciones,
            nombreMadre: person.nombreMadre,
            nombrePadre: person.nombrePadre,
            padreTelefono: person.padreTelefono,
            madreTelefono: person.madreTelefono,
            inscripcion: person.inscripcion,
            promocion: person.promocion
        });

        if (Object.keys(oldFields).length > 0) {
            await auditLog.register({
                entityType: 'ALUMNO',
                entityId: person.user_id,
                entityName: entityNameStr,
                actionType: 'UPDATE',
                userId: userData.id,
                userName: userData.name || userData.email,
                userRole: userData.role,
                campus: oldSnapshot.campus || userData.campus,
                summary: `${userData.name || userData.email} actualizó datos de alumno: ${person.name} (${oldSnapshot.matricula || ''})`,
                oldValue: oldFields,
                newValue: newFields
            });
        }

        // 2. Diff de pagos (por contenido, no por ID — se borran y reinsertan)
        const { hasChanges: pagosChanged, added, removed } = snapshotReader.getPaymentsDiff(
            oldSnapshot.pagos || [],
            newPagosConMonto
        );

        if (pagosChanged) {
            const fechaStr = (f) => !f ? '' : (f instanceof Date ? f.toISOString().substring(0, 10) : String(f).substring(0, 10));
            const base = {
                entityType: 'ALUMNO',
                entityId: person.user_id,
                entityName: entityNameStr,
                userId: userData.id,
                userName: userData.name || userData.email,
                userRole: userData.role,
                campus: oldSnapshot.campus || userData.campus,
            };
            for (const p of added) {
                const fecha = fechaStr(p.fecha);
                const monto = p.monto_registrado != null ? `$${Number(p.monto_registrado).toFixed(2)}` : '';
                await auditLog.register({
                    ...base,
                    actionType: 'PAGO_ADD',
                    summary: `${userData.name || userData.email} registró pago de ${entityNameStr} — ${fecha} ${monto}`,
                    oldValue: null,
                    newValue: { fecha, tipo: p.tipo, monto: p.monto_registrado != null ? Number(p.monto_registrado).toFixed(2) : '0.00' }
                });
            }
            for (const p of removed) {
                const fecha = fechaStr(p.fecha);
                const monto = p.monto_registrado != null ? `$${Number(p.monto_registrado).toFixed(2)}` : '';
                await auditLog.register({
                    ...base,
                    actionType: 'PAGO_REMOVE',
                    summary: `${userData.name || userData.email} quitó pago de ${entityNameStr} — ${fecha} ${monto}`,
                    oldValue: { fecha, tipo: p.tipo, monto: p.monto_registrado != null ? Number(p.monto_registrado).toFixed(2) : '0.00' },
                    newValue: null
                });
            }
        }
    }

    return { ...person }
};

const saveStudentAsistencias = async (person, userData = {}) => {
    console.log(person);
    if (Number.isNaN(person.id_alumno)) throw Error("Wrong Type");
    if (!person.id_alumno || !person.fecha || !person.id_clase) throw Error("Missing Fields");
    const sql = `INSERT INTO alumno_asistencias (id_alumno, fecha, id_clase) VALUES (?,?,?)`;
    await query(sql, [person.id_alumno, person.fecha, person.id_clase]);

    if (userData && userData.id) {
        const [alumnoRows, claseRows] = await Promise.all([
            query(
                `SELECT pe.name, al.matricula, us.campus FROM users us JOIN personal pe ON pe.id = us.personal_id JOIN alumno al ON al.user_id = us.id WHERE us.id = ? LIMIT 1`,
                [person.id_alumno]
            ),
            query(
                `SELECT alc.dia, alc.hora, ins.instrumento, pe.name AS maestro_name FROM alumno_clases alc JOIN instrumento ins ON ins.id = alc.id_instrumento JOIN users us ON us.id = alc.id_maestro JOIN personal pe ON pe.id = us.personal_id WHERE alc.id = ? LIMIT 1`,
                [person.id_clase]
            )
        ]);
        const alumno = alumnoRows[0] || {};
        const clase  = claseRows[0]  || {};
        const alumnoLabel = alumno.name && alumno.matricula
            ? `${alumno.name} (${alumno.matricula})`
            : `ID: ${person.id_alumno}`;
        const claseLabel = clase.dia
            ? `${clase.instrumento} — ${clase.dia} ${clase.hora} con ${clase.maestro_name}`
            : `Clase #${person.id_clase}`;
        await auditLog.register({
            entityType: 'ASISTENCIA',
            entityId: person.id_alumno,
            entityName: alumnoLabel,
            actionType: 'CREATE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: alumno.campus || userData.campus || null,
            summary: `${userData.name || userData.email} registró asistencia de ${alumnoLabel} — ${formatFechaLegible(person.fecha)}`,
            oldValue: null,
            newValue: { alumno: alumnoLabel, clase: claseLabel, fecha: person.fecha }
        });
    }

    return { ...person }
};



const saveTeacher = async (person, userData = {}) => {
    console.log(person);
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.clabe || !person.cuenta || !person.banco || !person.fecha_inicio) throw Error("Missing fields");
    const sql = `CALL InsertarMaestro(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const respuesta = await query(sql, [person.name, person.fechaNacimiento, person.domicilio, person.municipio, person.telefono, person.contactoEmergencia, person.email, person.role, person.clabe, person.cuenta, person.banco, person.fecha_inicio, person.comprobante, person.campus]);

    await query(`DELETE FROM maestro_instrumento WHERE maestro_id=?`, [respuesta[0][0].usuarioInsertado])
    await person.maestroInstrumentos.forEach(async (element) => {
        await query(`INSERT INTO maestro_instrumento (maestro_id, instrumento_id) values(?,?)`, [respuesta[0][0].usuarioInsertado, element.instrumento_id])
    });

    if (userData && userData.id) {
        await auditLog.register({
            entityType: 'MAESTRO',
            entityId: respuesta[0][0].usuarioInsertado,
            entityName: person.name,
            actionType: 'CREATE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: person.campus || userData.campus,
            summary: `${userData.name || userData.email} creó maestro: ${person.name}`,
            oldValue: null,
            newValue: { name: person.name, email: person.email, campus: person.campus, banco: person.banco }
        });
    }

    return { ...person }
}

const updateTeacher = async (person, userData = {}) => {
    //Con esto se valida que id  sea un numero
    console.log(person)
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio
    if (!person.id) throw Error("Missing Fields");
    if (!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.clabe || !person.cuenta || !person.fecha_inicio || !person.banco) throw Error("Missing fields");

    const oldSnapshot = (userData && userData.id) ? await snapshotReader.getMaestroSnapshot(person.user_id) : null;

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

    if (userData && userData.id) {
        const { oldFields, newFields } = snapshotReader.getDiff(oldSnapshot, {
            name: person.name, email: person.email, telefono: person.telefono,
            domicilio: person.domicilio, municipio: person.municipio, banco: person.banco,
            cuenta: person.cuenta, clabe: person.clabe
        });
        await auditLog.register({
            entityType: 'MAESTRO',
            entityId: person.user_id,
            entityName: (oldSnapshot && oldSnapshot.name) || person.name,
            actionType: 'UPDATE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: (oldSnapshot && oldSnapshot.campus) || userData.campus,
            summary: `${userData.name || userData.email} actualizó maestro: ${person.name}`,
            oldValue: Object.keys(oldFields || {}).length > 0 ? oldFields : oldSnapshot,
            newValue: Object.keys(newFields || {}).length > 0 ? newFields : { name: person.name, email: person.email }
        });
    }

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

const remove = async (id, userData = {}) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');

    // Capturar estado anterior ANTES del toggle
    const beforeRows = userData && userData.id
        ? await query(
            `SELECT us.status, us.campus, pe.name, us.email FROM users us JOIN personal pe ON pe.id = us.personal_id WHERE us.id=?`,
            [id]
          )
        : null;
    const beforeStatus  = beforeRows && beforeRows[0] ? beforeRows[0].status : null;
    const personaNombre = beforeRows && beforeRows[0] ? beforeRows[0].name : null;
    const personaEmail  = beforeRows && beforeRows[0] ? beforeRows[0].email : null;
    const personaCampus = beforeRows && beforeRows[0] ? beforeRows[0].campus : null;

    const sql = `UPDATE users SET status=IF(status = true, false, true) WHERE id=?`;
    await query(sql, [id]);

    if (userData && userData.id) {
        const nuevoStatus = beforeStatus !== null ? !beforeStatus : null;
        await auditLog.register({
            entityType: 'PERSONAL',
            entityId: parseInt(id),
            entityName: personaNombre || null,
            actionType: 'STATUS_CHANGE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: personaCampus || userData.campus,
            summary: `${userData.name || userData.email} cambió status de ${personaNombre || 'usuario'} a: ${nuevoStatus ? 'activo' : 'inactivo'}`,
            oldValue: { nombre: personaNombre, email: personaEmail, status: beforeStatus },
            newValue: { nombre: personaNombre, email: personaEmail, status: nuevoStatus }
        });
    }

    return { idDeleted: id };
}
const removeEmpleado = async (id, userData = {}) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');
    const sql1 = `SELECT personal_id FROM users WHERE id=?`;
    const sql2 = `DELETE FROM users WHERE id=?`;
    const sql3 = `DELETE FROM personal WHERE id=?`;
    const idPersonal = (await query(sql1, [id]))[0].personal_id;

    const oldSnapshot = (userData && userData.id) ? await snapshotReader.getPersonalSnapshot(idPersonal) : null;

    await query(sql2, [id]);
    await query(sql3, [idPersonal]);

    if (userData && userData.id) {
        await auditLog.register({
            entityType: 'PERSONAL',
            entityId: parseInt(id),
            entityName: oldSnapshot ? oldSnapshot.name : null,
            actionType: 'DELETE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: (oldSnapshot && oldSnapshot.campus) || userData.campus,
            summary: `${userData.name || userData.email} eliminó empleado: ${oldSnapshot ? oldSnapshot.name : id}`,
            oldValue: oldSnapshot,
            newValue: null
        });
    }

    return { idDeleted: id, idPersonal: idPersonal };
}

const removeRepo = async (id, userData = {}) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');

    let snapshot = null;
    if (userData && userData.id) {
        const rows = await query(
            `SELECT ar.id, ar.fecha, ar.alumno_id, ar.maestro_id, ar.hora, ar.instrumento, ar.fecha_original,
                    pe.name AS alumno_name, al.matricula, us.campus
             FROM alumno_repo ar
             JOIN users us ON us.id = ar.alumno_id
             JOIN personal pe ON pe.id = us.personal_id
             JOIN alumno al ON al.user_id = us.id
             WHERE ar.id = ? LIMIT 1`,
            [id]
        );
        snapshot = rows[0] || null;
    }

    const sql = `DELETE FROM alumno_repo WHERE id=?`;
    await query(sql, [id]);

    if (userData && userData.id && snapshot) {
        const alumnoLabel = snapshot.alumno_name && snapshot.matricula
            ? `${snapshot.alumno_name} (${snapshot.matricula})`
            : `ID: ${snapshot.alumno_id}`;
        await auditLog.register({
            entityType: 'REPOSICION',
            entityId: id,
            entityName: alumnoLabel,
            actionType: 'DELETE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: snapshot.campus || userData.campus || null,
            summary: `${userData.name || userData.email} eliminó reposición de ${alumnoLabel} — ${snapshot.fecha}`,
            oldValue: { alumno: alumnoLabel, fecha: snapshot.fecha, fecha_original: snapshot.fecha_original || null, hora: snapshot.hora || null, instrumento: snapshot.instrumento || null },
            newValue: null
        });
    }

    return { idDeleted: id };
}

const getMatriculaByAlumnoId = async (id) => {
    const result = await query(`SELECT matricula FROM alumno WHERE id=?`, [id]);
    return result[0]?.matricula || id;
}

const removeStudent = async (id, estado, userData = {}) => {
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if (!id) throw Error('Missing Fields');

    // Capturar estado anterior ANTES del update
    let alumnoUserId = parseInt(id);
    let matricula = null;
    let alumnoCampus = userData.campus;
    let alumnoNombre = null;
    let estadoAnterior = null;

    if (userData && userData.id) {
        const alumnoRow = await query(
            `SELECT a.user_id, a.matricula, a.estado, u.campus, pe.name
             FROM alumno a
             JOIN users u ON u.id = a.user_id
             JOIN personal pe ON pe.id = u.personal_id
             WHERE a.id = ?`,
            [id]
        );
        if (alumnoRow && alumnoRow[0]) {
            alumnoUserId  = alumnoRow[0].user_id;
            matricula     = alumnoRow[0].matricula;
            alumnoCampus  = alumnoRow[0].campus || userData.campus;
            alumnoNombre  = alumnoRow[0].name;
            estadoAnterior = alumnoRow[0].estado;
        }
    }

    const sql = `UPDATE alumno SET estado=? WHERE id=?`;
    await query(sql, [estado, id]);

    if (userData && userData.id) {
        await auditLog.register({
            entityType: 'ALUMNO',
            entityId: alumnoUserId,
            entityName: alumnoNombre && matricula ? `${alumnoNombre} (${matricula})` : (matricula || null),
            actionType: 'STATUS_CHANGE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: alumnoCampus,
            summary: `${userData.name || userData.email} cambió estado de alumno ${matricula || ''} a: ${estado}`,
            oldValue: { matricula, estado: estadoAnterior },
            newValue: { matricula, estado }
        });
    }

    return { idDeleted: id };
}

const removeStudentAsistencia = async (id_alumno, fecha, id_clase, userData = {}) => {
    if (Number.isNaN(id_alumno)) throw Error("Wrong Type");
    if (!id_alumno) throw Error('Missing Fields');
    const sql = `DELETE FROM alumno_asistencias WHERE id_alumno=? AND fecha=? AND id_clase=?`;
    await query(sql, [id_alumno, fecha, id_clase]);

    if (userData && userData.id) {
        const [alumnoRows, claseRows] = await Promise.all([
            query(
                `SELECT pe.name, al.matricula, us.campus FROM users us JOIN personal pe ON pe.id = us.personal_id JOIN alumno al ON al.user_id = us.id WHERE us.id = ? LIMIT 1`,
                [id_alumno]
            ),
            query(
                `SELECT alc.dia, alc.hora, ins.instrumento, pe.name AS maestro_name FROM alumno_clases alc JOIN instrumento ins ON ins.id = alc.id_instrumento JOIN users us ON us.id = alc.id_maestro JOIN personal pe ON pe.id = us.personal_id WHERE alc.id = ? LIMIT 1`,
                [id_clase]
            )
        ]);
        const alumno = alumnoRows[0] || {};
        const clase  = claseRows[0]  || {};
        const alumnoLabel = alumno.name && alumno.matricula
            ? `${alumno.name} (${alumno.matricula})`
            : `ID: ${id_alumno}`;
        const claseLabel = clase.dia
            ? `${clase.instrumento} — ${clase.dia} ${clase.hora} con ${clase.maestro_name}`
            : `Clase #${id_clase}`;
        await auditLog.register({
            entityType: 'ASISTENCIA',
            entityId: parseInt(id_alumno),
            entityName: alumnoLabel,
            actionType: 'DELETE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: alumno.campus || userData.campus || null,
            summary: `${userData.name || userData.email} eliminó asistencia de ${alumnoLabel} — ${formatFechaLegible(fecha)}`,
            oldValue: { alumno: alumnoLabel, clase: claseLabel, fecha },
            newValue: null
        });
    }

    return { idDeleted: id_alumno };
}

const removeStudentPermanente = async (uid, pid, userData = {}) => {
    if (Number.isNaN(uid) || Number.isNaN(pid)) throw Error("Wrong Type");
    if (!uid || !pid) throw Error('Missing Fields');

    const oldSnapshot = (userData && userData.id) ? await snapshotReader.getAlumnoSnapshot(parseInt(uid)) : null;

    const sql = `CALL EliminarAlumno(?,?)`;
    await query(sql, [uid, pid]);

    if (userData && userData.id) {
        await auditLog.register({
            entityType: 'ALUMNO',
            entityId: parseInt(uid),
            entityName: oldSnapshot ? `${oldSnapshot.name} (${oldSnapshot.matricula || ''})` : null,
            actionType: 'DELETE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: (oldSnapshot && oldSnapshot.campus) || userData.campus,
            summary: `${userData.name || userData.email} eliminó permanentemente alumno: ${oldSnapshot ? oldSnapshot.name : uid} (${oldSnapshot?.matricula || ''})`,
            oldValue: oldSnapshot,
            newValue: null
        });
    }

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

const createSolicitudBaja = async ({alumno_id, solicitante_id, motivo}, userData = {}) => {
    if (Number.isNaN(alumno_id) || Number.isNaN(solicitante_id)) throw Error("Wrong Type");
    if (!alumno_id || !solicitante_id || !motivo) throw Error('Missing Fields');

    const existing = await query(
        `SELECT id FROM solicitudes_baja WHERE alumno_id = ? AND estado = 'PENDIENTE' LIMIT 1`,
        [alumno_id]
    );
    if (existing.length > 0) throw Object.assign(Error('Ya existe una solicitud de baja pendiente para este alumno'), { statusCode: 409 });

    // Obtener nombre+matrícula del alumno y campus del solicitante para audit log
    const [alumnoInfo, solicitanteInfo] = await Promise.all([
        query(
            `SELECT al.matricula, pe.name FROM alumno al JOIN users us ON us.id = al.user_id JOIN personal pe ON pe.id = us.personal_id WHERE al.id = ?`,
            [alumno_id]
        ),
        userData.id
            ? query(`SELECT campus FROM users WHERE id = ?`, [userData.id])
            : Promise.resolve([])
    ]);

    const alumnoNombre   = alumnoInfo[0]?.name      || null;
    const alumnoMatricula = alumnoInfo[0]?.matricula || null;
    const campus         = solicitanteInfo[0]?.campus || userData.campus || null;
    const alumnoLabel    = alumnoNombre && alumnoMatricula
        ? `${alumnoNombre} (${alumnoMatricula})`
        : `ID: ${alumno_id}`;

    const sql = `INSERT INTO solicitudes_baja (alumno_id, solicitante_id, motivo) VALUES (?, ?, ?)`;
    const result = await query(sql, [alumno_id, solicitante_id, motivo]);

    if (userData && userData.id) {
        await auditLog.register({
            entityType: 'SOLICITUD_BAJA',
            entityId: result.insertId,
            entityName: alumnoLabel,
            actionType: 'BAJA_SOLICITADA',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus,
            summary: `${userData.name || userData.email} solicitó baja para alumno: ${alumnoLabel}`,
            oldValue: null,
            newValue: { alumno_id, matricula: alumnoMatricula, motivo }
        });
    }

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
            COALESCE(ps.name, 'Usuario eliminado') as solicitante_nombre,
            pap.name as aprobador_nombre,
            us.campus
        FROM solicitudes_baja sb
        JOIN users us ON us.id = sb.alumno_id
        JOIN personal pa ON pa.id = us.personal_id
        JOIN alumno al ON al.user_id = us.id
        LEFT JOIN users us_solicitante ON us_solicitante.id = sb.solicitante_id
        LEFT JOIN personal ps ON ps.id = us_solicitante.personal_id
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

const aprobarSolicitudBaja = async ({solicitud_id, aprobador_id, respuesta}, userData = {}) => {
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

    if (userData && userData.id) {
        const alumnoInfoRows = await query(
            `SELECT us.campus, al.matricula, pe.name FROM users us JOIN personal pe ON pe.id = us.personal_id JOIN alumno al ON al.user_id = us.id WHERE us.id = ? LIMIT 1`,
            [alumno_user_id]
        );
        const alumnoInfo = alumnoInfoRows[0] || {};
        const alumnoCampus = alumnoInfo.campus || userData.campus;
        const alumnoLabel  = alumnoInfo.name && alumnoInfo.matricula
            ? `${alumnoInfo.name} (${alumnoInfo.matricula})`
            : `ID: ${alumno_user_id}`;
        await auditLog.register({
            entityType: 'SOLICITUD_BAJA',
            entityId: solicitud_id,
            entityName: alumnoLabel,
            actionType: 'BAJA_APROBADA',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: alumnoCampus,
            summary: `${userData.name || userData.email} aprobó baja de alumno: ${alumnoLabel}`,
            oldValue: { estado: 'PENDIENTE' },
            newValue: { estado: 'APROBADA', respuesta: respuesta || 'Aprobado' }
        });
    }

    return {
        solicitud_id,
        aprobador_id,
        alumno_id,
        message: 'Solicitud aprobada y alumno dado de baja'
    };
};

const rechazarSolicitudBaja = async ({solicitud_id, aprobador_id, respuesta}, userData = {}) => {
    if (Number.isNaN(solicitud_id) || Number.isNaN(aprobador_id)) throw Error("Wrong Type");
    if (!solicitud_id || !aprobador_id || !respuesta) throw Error('Missing Fields');

    // Obtener alumno_id de la solicitud para luego traer nombre/matrícula/campus
    const solicitudRows = await query(`SELECT alumno_id FROM solicitudes_baja WHERE id = ?`, [solicitud_id]);
    const alumno_user_id = solicitudRows[0]?.alumno_id || null;

    const sql = `
        UPDATE solicitudes_baja
        SET estado = 'RECHAZADA',
            respuesta = ?,
            fecha_respuesta = NOW(),
            aprobador_id = ?
        WHERE id = ?
    `;
    await query(sql, [respuesta, aprobador_id, solicitud_id]);

    if (userData && userData.id) {
        let alumnoLabel = `ID: ${alumno_user_id}`;
        let campus = userData.campus || null;
        if (alumno_user_id) {
            const alumnoInfoRows = await query(
                `SELECT us.campus, al.matricula, pe.name FROM users us JOIN personal pe ON pe.id = us.personal_id JOIN alumno al ON al.user_id = us.id WHERE us.id = ? LIMIT 1`,
                [alumno_user_id]
            );
            const info = alumnoInfoRows[0] || {};
            campus = info.campus || campus;
            if (info.name && info.matricula) alumnoLabel = `${info.name} (${info.matricula})`;
        }
        await auditLog.register({
            entityType: 'SOLICITUD_BAJA',
            entityId: solicitud_id,
            entityName: alumnoLabel,
            actionType: 'BAJA_RECHAZADA',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus,
            summary: `${userData.name || userData.email} rechazó baja de alumno: ${alumnoLabel}`,
            oldValue: { estado: 'PENDIENTE' },
            newValue: { estado: 'RECHAZADA', respuesta }
        });
    }

    return { solicitud_id, aprobador_id, message: 'Solicitud rechazada' };
};

// ========================================
// ELIMINACIÓN SEGURA DE MAESTROS
// ========================================

const deleteMaestroSeguro = async (user_id, userData = {}) => {
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

    // PASO 2: SIEMPRE ARCHIVAR (status = 0)
    // Ya no eliminamos maestros - todos van a "Archivados"
    const oldSnapshot = (userData && userData.id) ? await snapshotReader.getMaestroSnapshot(user_id) : null;
    const sqlArchivar = `UPDATE users SET status = 0 WHERE id = ?`;
    await query(sqlArchivar, [user_id]);

    const mensajeDetalle = totalRegistros > 0
        ? `El maestro tiene ${totalRegistros} registro(s) histórico(s): ${detalles.join(', ')}.`
        : `El maestro no tiene historial académico.`;

    if (userData && userData.id) {
        await auditLog.register({
            entityType: 'MAESTRO',
            entityId: parseInt(user_id),
            entityName: oldSnapshot ? oldSnapshot.name : null,
            actionType: 'ARCHIVE',
            userId: userData.id,
            userName: userData.name || userData.email,
            userRole: userData.role,
            campus: (oldSnapshot && oldSnapshot.campus) || userData.campus,
            summary: `${userData.name || userData.email} archivó maestro: ${oldSnapshot ? oldSnapshot.name : user_id}`,
            oldValue: oldSnapshot ? { status: 1 } : null,
            newValue: { status: 0, archived: true }
        });
    }

    return {
        deleted: false,
        archived: true,
        message: `Maestro archivado exitosamente. ${mensajeDetalle}`,
        registros_historicos: totalRegistros,
        detalles: detalles
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
    findAllTeacherByStatus,
    findAllTeacherArchived,
    findAllInstrumento,
    saveStudent,
    updateStudent,
    remove,
    saveTeacher,
    updateTeacher,
    checkEmailStaff,
    checkEmailStaffExcluding,
    saveUser,
    updateUser,
    findAllEncargado,
    findAllRecepcionista,
    activeStudents,
    findAllStudentAsistencias,
    getMatriculaByAlumnoId,
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