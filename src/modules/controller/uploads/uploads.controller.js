const { Response, Router } = require('express');
const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { validateError } = require('../../../utils/functions');
const { findImg, saveImg } = require('./uploads.gateway');

const fechaActual = new Date();
const fechaHoraString = fechaActual.toLocaleString('en-US', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit'
}).replace(/[^0-9]/g, '');

// 🟢 Storage para el POST (usa la fecha en el nombre)
const storagePost = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './src/img/');
  },
  filename: function (req, file, cb) {
    cb(null, `${fechaHoraString}${file.originalname}`);
  }
});

// Configuración para el PUT - Usar memoria en lugar de almacenamiento en disco
const memoryStorage = multer.memoryStorage();

const uploadPost = multer({ storage: storagePost });
const uploadPut = multer({ storage: memoryStorage });

// Función para asegurarse de que exista el directorio
const ensureDirectories = () => {
  const imgDir = './src/img';
  if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
  }
};

// Ejecutamos esto al iniciar el servidor
ensureDirectories();

const getImg = async (req, res = Response) => {
  try {
    const { id } = req.params;
    const imagen = await findImg(id);
    if (!imagen.length) {
      return res.status(404).json({ message: 'Imagen no encontrada' });
    }
    const rutaImagen = path.join(__dirname, `../../../img/${imagen[0].path}`);
    res.sendFile(rutaImagen);
  } catch (error) {
    console.log(error);
    const message = validateError(error);
    res.status(400).json({ message });
  }
};

const getImgCampus = async (req, res = Response) => {
  try {
    const { id } = req.params;
    const rutaImagen = path.join(__dirname, `../../../img/${id}`);
    res.sendFile(rutaImagen);
  } catch (error) {
    console.log(error);
    const message = validateError(error);
    res.status(400).json({ message });
  }
};

const uploadFoto = async (req, res = Response) => {
  try {
    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ message: 'No se ha enviado ningún archivo.' });
    }
    const { id } = req.params;
    const { filename } = archivo;
    console.log(archivo);
    const imagen = await saveImg({ id, filename });
    res.status(200).json(imagen);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: 'Error al subir la imagen' });
  }
};

const uploadFotoCampus = async (req, res = Response) => {
  try {
    console.log("Procesando imagen para conversión a JPG");
    const archivo = req.file;
    if (!archivo) {
      return res.status(400).json({ message: 'No se ha enviado ningún archivo.' });
    }
    
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ message: 'Debe proporcionar un nombre de archivo en los parámetros.' });
    }

    // Ruta final donde se guardará el archivo JPG
    const finalFilePath = path.join('./src/img/', `${id}.jpg`);
    
    try {
      // Procesar el buffer de memoria directamente con sharp y guardar como JPG
      await sharp(archivo.buffer)
        .jpeg({ quality: 90 })
        .toFile(finalFilePath);
      
      console.log(`Imagen convertida y guardada como: ${finalFilePath}`);
      
      // Si estás guardando la referencia en una base de datos
      // const imagen = await saveImg({ id, filename: `${id}.jpg` });
      
      res.status(200).json({ 
        message: 'Imagen convertida a JPG y subida correctamente', 
        id,
        path: `${id}.jpg` 
      });
    } catch (sharpError) {
      console.error('Error en procesamiento de imagen:', sharpError);
      res.status(500).json({ 
        message: 'Error al procesar la imagen', 
        error: sharpError.message 
      });
    }
  } catch (error) {
    console.log('Error general:', error);
    res.status(500).json({ message: 'Error al procesar o convertir la imagen' });
  }
};

const uploadsRouter = Router();

uploadsRouter.post('/upload/:id', uploadPost.single('archivo'), uploadFoto);
uploadsRouter.put('/upload/:id', uploadPut.single('archivo'), uploadFotoCampus);
uploadsRouter.get('/image/:id', getImg);
uploadsRouter.get('/imageCampus/:id', getImgCampus);

module.exports = { uploadsRouter };