'use strict'
var jwt = require('jwt-simple');
var moment = require('moment');
var secret = "clave-secreta-para-generar-el-token2353465";

exports.authenticated = function (req, res, next){
	
	//Comprobar si llega autorización 
	if(!req.headers.authorization){
		return res.status(403).send({
			message: 'La peticion no tiene la cabecera de authorization'

		});
	}
	//Limpiar el token y quitar comillas 
	var token = req.headers.authorization.replace(/['"]+/g, '');
	//decodificar token 
	try{
		var payload = jwt.decode(token, secret);
	//compronar si el token a expirado 	
		if(payload.ex <= moment().unix()){
			return res.status(404).send({
				message: 'El token expiró'

			});
		}
	}catch(ex){
		return res.status(404).send({
			message: 'El token no es valido'

		});
	}

	//adjuntar usuario identificado a la request
	req.user = payload;



	//pasar a la acción 
	next();
}