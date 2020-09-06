'use strict'

var express = require('express');
var UserController = require('../controllers/user');


var router = express.Router();
var md_auth = require('../middleware/authenticated');
var multipart = require('connect-multiparty');
var md_upload = multipart({uploadDir: './images/users'});



//Rutas de prueba 
router.get('/probando', UserController.probando);
router.post('/testeando', UserController.testeando);

//Rutas de Usuarios
router.post('/register', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated, UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.getAvatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);
module.exports = router; 