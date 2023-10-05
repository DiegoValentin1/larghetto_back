const express = require('express');
require('dotenv').config();
const cors = require('cors');
const {personalRouter, instrumentoRouter, promocionRouter} = require('../modules/controller/routes'); 

const app = express();

app.set("port", process.env.PORT ||3000);
app.use(cors({origins:"*"}));
app.use(express.json({limit:'50mb'}));

app.get('/', (req, rest)=>{
    rest.send("Welcome")
});

//http://localhost:3000
app.use('/api/personal', personalRouter);
app.use('/api/instrumento', instrumentoRouter);
app.use('/api/promocion', promocionRouter);
module.exports = {app};
