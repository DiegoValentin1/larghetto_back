const {Response, Router} = require('express');
const { auth, checkRoles } = require('../../../config/jwt');
const multer = require('multer');
const {validateError} = require('../../../utils/functions');
const { findAllTotal, saveImg, findImg} = require('./uploads.gateway');
const path = require('path');


const fechaActual = new Date();

const fechaHoraString = fechaActual.toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}).replace(/[^0-9]/g, '');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './src/img/'); // Indica el directorio donde se guardarán los archivos
    },
    filename: function (req, file, cb) {
      cb(null, `${fechaHoraString}${file.originalname}`); // Utiliza el nombre original del archivo
    }
  });
  
  const upload = multer({ storage: storage });

const getImg = async(req, res=Response)=>{
    try {
      const {id} = req.params;
        const imagen = await findImg(id);
        // res.status(200).json(stat);
        console.log(imagen);
        const rutaImagen = path.join(__dirname, `../../../img/${imagen[0].path}`);
        res.sendFile(rutaImagen);
    } catch (error) {
        console.log(error);
        const message = validateError(error);
        res.status(400).json({message});
    }
}

const uploadFoto = async (req, res=Response) => {
    // Accede al archivo enviado a través de req.file
    const archivo = req.file;
    if (!archivo) {
      res.status(400).json({ message: 'No se ha enviado ningún archivo.' });
    } else {
      const {id} = req.params;
      const {filename} = archivo;
        console.log(archivo);
        const imagen = await saveImg({id, filename});
      res.status(200).json(imagen);
    }
  }





const uploadsRouter = Router();

uploadsRouter.post('/upload/:id', upload.single('archivo'), uploadFoto);
uploadsRouter.get('/image/:id', getImg);

module.exports = {uploadsRouter, };