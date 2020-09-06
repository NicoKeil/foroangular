'use strict'
var validator = require('validator');
var Topic = require('../models/topic');
var controller = {

	test: function(req, res){
		return res.status(200).send({
			message: 'Hola que tal'
		});
	},

	save: function(req, res){

		//Recoger parametros por post 
		var params = req.body;
		//Validar los datos
		try{
			var validate_title = !validator.isEmpty(params.title);
			var validate_content = !validator.isEmpty(params.content);
			var validate_lang = !validator.isEmpty(params.lang);
		}catch(err){
			return res.status(200).send({
				message: 'faltan datos por enviar'
			});
		}

		if(validate_content && validate_title && validate_lang){
			//Crear el objeto a guardar
			var topic = new Topic();
			//Asignarle valores 
			topic.title = params.title;
			topic.content = params.content;
			topic.code = params.code;
			topic.lang = params.lang;
			topic.user = req.user.sub;
			//Guardar el topic
			topic.save((err, topicStored) =>{

				if(err || !topicStored){
					return res.status(404).send({
						status: 'error',
						message: 'El tema no se ha guardado'
					});
				}
				//Devolver una respuesta
				return res.status(200).send({
					status: 'success',
					topic: topicStored
				});
			});
			
		}else{
			//Devolver una respuesta
			return res.status(200).send({
				message: 'Los datos no son validos'
			});
		}

	},

	getTopics: function(req, res){
		//Cargar la libreria de paginacion (en el modelo)
		//Recoger la pagina actual
		if(!req.params.page || req.params.page == null || req.params.page == '0' || req.params.page == undefined ){
			var page = 1;


		}else{
			var page = parseInt(req.params.page);

		}
		//Indicar las opciones de paginacion 
		var options = {
			sort: { date: -1 },
			populate: 'user',
			limit: 5,
			page: page
		};

		//Find paginado
		Topic.paginate({}, options, (err, topics) => {

			if(err){
				return res.status(500).send({
					status: "error",
					message: 'este es el controlador',
 
				});
			}
			if(!topics){
				return res.status(404).send({
					status: "not-found",
					message: 'no hay topics',
 
				});
			}
			
			//Devolver resultado (topics, total de topic, total de paginas)
				return res.status(200).send({
					status: "success",
					topics: topics.docs,
					totalDocs: topics.totalDocs,
					totalPages: topics.totalPages
				});
			
		});
		
	},

	getTopicsByUser: function(req, res){

		//Conseguir el id del usuario
		var userId = req.params.user
		//hacer un find con una condicion de usuario 
		Topic.find({
			user: userId

		})
		.sort([['date', 'descending']])
		.exec((err, topics) =>{
			if(err){
				return res.status(500).send({
					status: "error",
					message: "Error en la petición"
				});
			}
			if(!topics){
				return res.status(404).send({
					status: "error",
					message: "No hay temas para mostrar"
				});
			}
		
			//Devolcer un usuario
			return res.status(200).send({
						status: "success",
						topics
						
			});
		});
		
	},

	getTopic: function(req, res){

		//Sacar el id del topic de la url 
		var topicId = req.params.id
		//Find por id del topic 
		Topic.findById(topicId)
			 .populate('user')
			 .populate('comments.user')
			 .exec((err, topic) => {
			 	if(err){
					//devolcer el resultado
					return res.status(500).send({
						status: "error",
						message:"error en la petición"				
					});
			 	}
			 	if(!topic){
					
					return res.status(404).send({
						status: "error",
						message:"El topic no existe"				
					});
			 	}
			 	//devolcer el resultado
				return res.status(200).send({
					status: "success",
					topic				
				});
			 });

	},

		update: function(req, res){

			//Recoger el id del topic de la url 
			var topicId = req.params.id;
			//Recoger los datos que llegan desde post
			var params = req.body;
			//validar datos
			try{
				var validate_title = !validator.isEmpty(params.title);
				var validate_content = !validator.isEmpty(params.content);
				var validate_lang = !validator.isEmpty(params.lang);
			}catch(err){
				return res.status(200).send({
					message: 'faltan datos por enviar'
				});
			}
			if(validate_title && validate_content && validate_lang){
				//montar un JSON con los datos modificables
				var update = {
					title: params.title,
					content: params.content,
					code: params.code,
					lang: params.lang
				};
				//Find and update del topic por id y por id_user
				Topic.findOneAndUpdate({_id: topicId, user: req.user.sub}, update, {new:true}, (err, topicUpdate)=>{
					
					if(err){			
						return res.status(500).send({
							status: "error",
							message: "Error en la petición"				
						});
					}
					if(!topicUpdate){
						return res.status(404).send({
							status: "error",
							message: "Error al actualizar el topic"				
						});
					}

				//Devolver una respuesta 
					return res.status(200).send({
						status: "success",
						topicUpdate				
					});

				});
				
			}else{

				return res.status(200).send({
					status: "error",
					message: "La validación de los datos no es correcta"	
			});
		}
	},
	delete: function(req, res){
		//Sacar el topic por la url
		var topicId = req.params.id;
		// Find and delete por el topicId y por userId
		Topic.findOneAndDelete({_id: topicId, user: req.user.sub}, (err, topicRemove) => {

			if(err){			
				return res.status(500).send({
					status: "error",
					message: "Error al borrar"				
				});
			}
			if(!topicRemove){
				return res.status(404).send({
					status: "error",
					message: "Error al borrar el topic"				
				});
			}
			return res.status(200).send({
				status: 'success',
				topic: topicRemove
			});
		})
		
	},

	search: function(req, res){

		//Sacar el string a buscar de la url
		var searchString = req.params.search;
		//Find or 
		Topic.find({ 
				"$or": [
				{"title": {"$regex": searchString, "$options": "i"} },
				{"content": {"$regex": searchString, "$options": "i"} },
				{"code": {"$regex": searchString, "$options": "i"} },
				{"lang": {"$regex": searchString, "$options": "i"} }
		]})
		.populate('user')
		.sort([['date', 'descending']])
		.exec((err, topics) =>{
			if(err){			
				return res.status(500).send({
					status: "error",
					message: "Error en la petición"				
				});
			}
			if(!topics){			
				return res.status(404).send({
					status: "error",
					message: "No hay temas disponibles"				
				});
			}

			return res.status(200).send({
				status: 'success',
				topics
			})
		});	

	}
};

module.exports = controller;