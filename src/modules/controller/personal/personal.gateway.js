const {query} = require('../../../utils/mysql');

const findAll = async()=>{
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id`;
    return await query(sql, []);
}

const findAllStudent = async()=>{
    const sql = `SELECT pe.*,pe.id as personal_id, us.email, us.role, us.status , us.id as id_user, al.*, ins.instrumento, personal_maestro.name as maestro, promo.promocion
    FROM personal pe 
    join users us on us.personal_id=pe.id 
    join alumno al on al.user_id=us.id
    join instrumento ins on ins.id=instrumento_id
    join users maestro on al.maestro_id=maestro.id
    join personal personal_maestro on maestro.personal_id=personal_maestro.id
    join promocion promo on promo.id=al.promocion_id
    WHERE us.role='ALUMNO'`;
    return await query(sql, []);
}

const findAllTeacher = async()=>{
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id WHERE us.role='MAESTRO'`;
    return await query(sql, []);
}

const findAllInstrumento = async()=>{
    const sql = `SELECT * FROM instrumento`;
    return await query(sql, []);
}

const findById = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type");
    if(!id)throw Error("Missing fields");
    const sql = `SELECT pe.*, us.email, us.role, us.status , us.id as user_id
    FROM personal pe join users us on us.personal_id=pe.id WHERE user_id=?`;

    return await query(sql, [id]);
}

const saveStudent = async(person)=>{
    console.log(person);
    if(!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.nivel || !person.mensualidad || !person.instrumento || !person.maestro || !person.hora || !person.dia || !person.promocion)  throw Error("Missing fields");
    const sql = `CALL InsertarPersonalUsuarioAlumno(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const {insertedId} = await query(sql, [person.name, person.fechaNacimiento,person.domicilio,person.municipio, person.telefono,person.contactoEmergencia,person.email,person.role,person.nivel,person.mensualidad,person.instrumento,person.maestro,person.hora,person.dia,person.promocion]);

    return {...person, id:insertedId}
}

const updateStudent = async (person) => {
    //Con esto se valida que id  sea un numero
    if (Number.isNaN(person.id)) throw Error("Wrong Type");
    //Valida que el id no venga vacio, Espera que mandes un parametro, Y no uno vacio 
    if (!person.id) throw Error("Missing Fields");
    if(!person.name || !person.fechaNacimiento || !person.domicilio || !person.municipio || !person.telefono || !person.contactoEmergencia || !person.email || !person.role || !person.nivel || !person.mensualidad || !person.instrumento || !person.maestro || !person.hora || !person.dia || !person.promocion)  throw Error("Missing fields");
    const sql = `CALL ActualizarPersonalUsuarioAlumno(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;
    const {insertedId} = await query(sql, [person.id, person.name, person.fechaNacimiento.substring(0,10),person.domicilio,person.municipio, person.telefono,person.contactoEmergencia,person.email,person.role,person.nivel,person.mensualidad,person.instrumento,person.maestro,person.hora,person.dia,person.promocion]);
    return{ ...person }
};

const remove = async(id)=>{
    if (Number.isNaN(id)) throw Error("Wrong Type"); 
    if (!id) throw Error('Missing Fields');
    const sql = `UPDATE users SET status=IF(status = true, false, true) WHERE id=?`;
    await query(sql,[id]);

    return{ idDeleted:id };
}

module.exports = {findAllStudent, findAllTeacher, findAllInstrumento , saveStudent, updateStudent, remove,/* findAllAdmin*/};