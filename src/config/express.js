const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { auth } = require('./jwt');
const {personalRouter, instrumentoRouter, promocionRouter, authRouter, statsRouter, claseRouter, uploadsRouter} = require('../modules/controller/routes');

const app = express();

app.set("port", 3001);
app.set("host", "127.0.0.1");
app.use(cors({origins:"*"}));
app.use(express.json({limit:'50mb'}));

app.get('/', (req, rest)=>{
    rest.send("Welcome")
});

// Rutas públicas (sin autenticación)
app.use('/api/auth', authRouter);

// Rutas protegidas (requieren autenticación y usuario activo)
app.use('/api/personal', auth, personalRouter);
app.use('/api/instrumento', auth, instrumentoRouter);
app.use('/api/promocion', auth, promocionRouter);
app.use('/api/stats', auth, statsRouter);
app.use('/api/clase', auth, claseRouter);
app.use('/api/uploads', auth, uploadsRouter);
module.exports = {app};

