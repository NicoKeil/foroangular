'use strick'
var validator = require('validator');
var User = require('../models/user');
var bcrypt = require('bcrypt-node');
var jwt = require('../services/jwt');
var fs = require('fs');
var path = require('path');

var controller = {
	probando: function(req, res){
		return res.status(200).send({
			message: 'Soy el metodo probando'
		});
	},
	testeando: function(req, res){
		return res.status(200).send({
			message: 'Soy el metodo Testeando'
		});
	},

	save: function(req, res){
		//Recoger los parametros de la petición 
		var params = req.body;
		//Validar los datos
		try{
		var validate_name = !validator.isEmpty(params.name);
		var validate_surname = !validator.isEmpty(params.surname);
		var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		var validate_password = !validator.isEmpty(params.password);
		}catch{
			
			return res.status(200).send({
			message: 'Faltan datos correctos'

			});
		}
		if(validate_name && validate_surname && validate_email && validate_password){
		//Crear Objeto de usuario 
		 var user = new User();
		//Asignar valores al usuario 
		user.name = params.name;
		user.surname = params.surname;
		user.email = params.email.toLowerCase();
		user.role = 'ROLE_USER';
		user.image = null;

		//Comprobar si existe el usuario,

		User.findOne({email: user.email}, (err, issetUser) => {
			if(err){
				return res.status(500).send({
				message: 'Error al comprobar la duplicidad del usuario',
				});
			}

			if(!issetUser){
			//si no existe sifrar la contraseña 
			bcrypt.hash(params.password, null, null, (err, hash) => {
				user.password = hash;
				//guardar el usuario

				
				user.save((err, userStored) => {
					if(err){
						return res.status(500).send({
							message: 'Error al guardar el usuario',
						});
					}

					if(!userStored){
						return res.status(400).send({
							message: 'El usuario no se ha guardado',
						});
					}
					return res.status(200).send({
						status: 'success',
						user: userStored
					});
				});// CLose save
			});//Close bcrypt
			

			
			}else{
				return res.status(200).send({
				message: 'El usuario ya esta registrado',
				});
			}
		});
		
		}else{
			return res.status(400).send({
			message: 'La validación de los datos es incorrecta, intenta de nuevo',
			
		});
		}

	},

	login: function(req, res){
		//Recoger los parametros de la peticion 
		var params = req.body;
		var user = new User();
		//Validar los parametros
		try{
		var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
		var validate_password = !validator.isEmpty(params.password);
		}catch{
			return res.status(200).send({
				message: 'Faltan datos'
			});
		}
			if(!validate_email || !validate_password){
				return res.status(200).send({
					message: 'Los datos son incorrectos, envialos bien'
				});

			}
			//Buscar los usuarios, que concida 
			User.findOne({email: params.email.toLowerCase()}, (err, user) =>{
				
			if(err){
				return res.status(500).send({
					message: 'Error al intentar identificarse'
					
				});
			}
			if(!user){
				return res.status(404).send({
					message: 'Error al intentar identificar el usuario '
					
				});
			}
			
		
			
				//Si lo encuentra,
				//Comprobar la contraseña (concidencia de email y password / bcrypt)
				bcrypt.compare(params.password, user.password, function (err, check){
					
					//Si es correcto, 
					if(check){

					//Generar token de jwt y devolverlo
						if(params.gettoken){
							return res.status(200).send({
								status: 'success',
								token: jwt.createToken(user)
							});
						}else{
						//Limpiar el objeto
							user.password = undefined;
							//devolver los datos
							return res.status(200).send({
								status: 'success',
								user
							});
						}
						
					}else{

						return res.status(200).send({
							message: 'Las credenciales no son correctas'

						});
					}
					
				});
			});	 
				
		},


		update: function(req, res){

			// Recoger los datos del usuario 
			var params = req.body;
			// Validar datos
			try{
				var validate_name = !validator.isEmpty(params.name);
				var validate_surname = !validator.isEmpty(params.surname);
				var validate_email = !validator.isEmpty(params.email) && validator.isEmail(params.email);
			}catch{
				return res.status(200).send({
					message: 'faltan datos por enviar',	
				});
			}
			// Eliminar propiedades inecesarias 
			delete params.password;
			delete params.role;
			
			var userId = req.user.sub;

			//comprobar si el email es unico 
			if(req.user.email != params.email){
				User.findOne({email: params.email.toLowerCase()}, (err, user) =>{
					if(err){
						return res.status(500).send({
							message: 'Error al intentar identificarse'
							
						});
					}
					if(user && user.email == params.email){
						return res.status(200).send({
							message: 'el email no puede ser modificado'
					
						});
					}else{
						// Buscar y actualizar documento 
						User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdate) => {
							if(err){
								return res.status(200).send({
									status: 'error',
									message: 'Error al actualizar el usuario'
								});

							}
							if(!userUpdate){
								return res.status(200).send({
									status: 'error',
									message: 'No se ha actualizado el usuario'
								});
							}
						// Devolver respuesta 
							return res.status(200).send({
								status: 'success',
								user: userUpdate
							});
						
						});
					}
				});
			}else{

				// Buscar y actualizar documento 
				User.findOneAndUpdate({_id: userId}, params, {new: true}, (err, userUpdate) => {
					if(err){
						return res.status(200).send({
							status: 'error',
							message: 'Error al actualizar el usuario'
						});

					}
					if(!userUpdate){
						return res.status(200).send({
							status: 'error',
							message: 'No se ha actualizado el usuario'
						});
					}
				// Devolver respuesta 
					return res.status(200).send({
						status: 'success',
						user: userUpdate
					});
				
				});
			}
		},

		uploadAvatar: function(req, res){
			//Configuración del modulo multiparty (md) routes/user.js
			
			//Recoger el fichero de la petición 
			var fileName = 'Imagen no subida...';
			
			 if(!req.files){
			 	return res.status(200).send({
					message: fileName
				});
			}
			//Conseguir el nombre y extencion del archivo
			var file_path = req.files.file0.path;
			
	    	var file_split = file_path.split('/');

	    	var file_name = file_split[2];

	    	var ext_split = file_name.split('\.');

	    	var file_ext = ext_split[1]

	    	//Comprobar la extención 
		    if(!file_ext == 'png' || !file_ext == 'gif' || !file_ext == 'jpg' || !file_ext == 'jpeg'){


			   	fs.unlink(file_path, (err) => {
					return res.status(200).send({
						message: 'La extención del archivo no es valida',
						
					});

			   	});
			}else{
				//Sacar el id del usuario identificado 
				var userId = req.user.sub;
				//Buscar y actulizar documentos db
				User.findOneAndUpdate({_id: userId}, {image: file_name}, {new:true}, (err, userUpdate) => {

					if(err || !userUpdate){
						return res.status(500).send({
						status: 'error',
						message: 'error al subir la imagen ',

						
					});
					}
					//Devolver respuesta
					return res.status(200).send({
						status: 'success',
						message: 'todo ok',
						user:  userUpdate
					});
				});
				
			}
		     		

		},

		getAvatar: function (req, res){
			var fileName = req.params.fileName;
			var pathFile = './images/users/' + fileName;

			fs.exists(pathFile, (exists) => {
				if(exists){
					res.sendFile(path.resolve(pathFile));
				}else{
					return res.status(404).send({
						message: 'La imagen no existe'
					});
				}
			});
		},

		getUsers: function(req, res){
			User.find().exec((err, users) => {
				if(err || !users){
					return res.status(404).send({
						statuss: 'error',
						message: 'no hay usuarios para mostrar'
					});
				}

				return res.status(200).send({
					status: 'success',
					users
				});
			});
		},

		getUser: function(req, res){
			var userId = req.params.userId;

			User.findById(userId).exec((err, user) => {
				if(err || !user){
					return res.status(404).send({
						statuss: 'error',
						message: 'no existe el usuario'
					});
				}

				return res.status(200).send({
					status: 'success',
					user
				});
			});
		},



	};



module.exports = controller;