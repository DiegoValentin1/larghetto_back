const {personalRouter} = require('./personal/personal.controller');
const {authRouter} = require("./auth/auth.controller");
const {instrumentoRouter} = require("./instrumento/instrumento.controller");
const {promocionRouter} = require("./promocion/promocion.controller");
const {statsRouter} = require('./stats/stats.controller')
const {claseRouter} = require('./clase/clase.controller');

module.exports = {personalRouter, authRouter, instrumentoRouter, promocionRouter, statsRouter, claseRouter};