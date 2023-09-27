const {personalRouter} = require('./personal/personal.controller');
const {authRouter} = require("./auth/auth.controller");

module.exports = {personalRouter, authRouter};