const mysql = require('mysql2');
require('dotenv').config();
const WebSocket = require('ws');

const wss = new WebSocket.Server({host:"104.237.128.187",port:8080});

wss.on('connection', function connection(ws){{
    console.log('Cliente conectado al ws')
}})

const sendNotification = (resultados)=>{
    console.log('sendNoti');
    wss.clients.forEach((client)=>{
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({resultados}));
        }
    })
}



const client = mysql.createPool({
    connectionLimit: 5,
    host: "104.237.128.187",
    user: "diego",
    password: "Linode pass 01",
    database: "larghetto",
    port: 3306
});//crea una alberca de conecciones, con maximo 5



const query = (sql,params)=>{
    return new Promise((resolve, reject)=>{
        client.getConnection((err, conn)=>{
            if(err) reject(err);
            conn.query(sql, params, (err, rows)=>{
                if (err) reject(err);
                conn.release();
                resolve(rows);
            })
        })
    })
};

client.getConnection((err, conn) => {
    if (err) {
      console.error('Error de conexión:', err);
      return;
    }
    console.log('Conexión a la base de datos exitosa');
  
    // Consulta inicial o cualquier acción que desees realizar al inicio
    realizarAcciones();
  
    // Establecer un intervalo para realizar consultas periódicas
    setInterval(realizarAcciones, 5000); // Realiza acciones cada 5 segundos (ajusta según tu necesidad)
  });
  
  // Función para realizar acciones basadas en cambios en la tabla
  function realizarAcciones() {
    const sql = 'SELECT pe.name, alu.proximo_pago FROM alumno_asistencias als JOIN users us on us.id=als.id_alumno JOIN personal pe on pe.id=us.personal_id JOIN alumno alu on alu.user_id=us.id WHERE als.fecha >= NOW() - INTERVAL 5 SECOND;';
  
    client.query(sql, async(err, results) => {
      const results2 = await query('SELECT pe.name, alu.proximo_pago FROM alumno_asistencias als JOIN users us on us.id=als.id_alumno JOIN personal pe on pe.id=us.personal_id JOIN alumno alu on alu.user_id=us.id ORDER BY als.id DESC LIMIT 3;', [])
      try {
        if (results2[0].name===results2[1].name) {
          await query("DELETE FROM alumno_asistencias ORDER BY id DESC LIMIT 1", []);
          console.log("Se borro");
          console.log(results2[0])
        }
      } catch (error) {
        console.log(error);
      }
      if (err) {
        console.error('Error al realizar consulta:', err);
        return;
      }
  
      // Realizar acciones en función de los resultados de la consulta
      if (results.length > 0) {
        sendNotification({...results, ...results2});
        // Ejemplo: Acciones a realizar si se detectan cambios en la tabla
        console.log('Se detectaron cambios:', {...results, ...results2});
        // Realizar aquí las acciones deseadas, como peticiones HTTP, actualizaciones, etc.
      } else {
        console.log('No se detectaron cambios en la tabla.');
      }
    });
}

module.exports = {query};