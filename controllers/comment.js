'use strict'

var Topic = require('../models/topic');
var validator = require('validator');


var controller = {
	add: function(req, res){

		//Recoger el id del topic de la url
		var topicId = req.params.topicId
		//Find por el id del topic 
		Topic.findById(topicId).exec((err, topic) =>{

			if(err){
				return res.status(500).send({
					status: "error",
					message: 'Error en la peticón'
				});
			}
			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: 'Error al guardar el comentario'
				});
			}
			//Comprobar si el objeto de usuario me llega
			if(req.body.content){

				try{
					var validate_content = !validator.isEmpty(req.body.content);
				}catch(err){
					return res.status(200).send({
						message: 'faltan datos por enviar'
					});
				}

				if(validate_content){
					var comment = {
						user: req.user.sub,
						content: req.body.content
					};

					//En la propiedad comments del objeto resultante hacer un push
					topic.comments.push(comment);
					//Guardar el topic completo
					topic.save((err) => {
						if(err){
							return res.status(500).send({
								status: "error",
								message: 'Error al guardar el comentario'
							});
						}

						Topic.findById(topic._id)
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

					});

				}else{
					return res.status(200).send({
						message: 'No se han validado los datos correctamente'
					});
				}
			}

		});

	},

	update: function(req, res){

		// Conseguir el id del comentario que llega de la url
		var commentId = req.params.commentId;
		//recoger datos del body y validar 
		var params = req.body;
		
		try{
			var validate_content = !validator.isEmpty(params.content);
			}catch(err){
				return res.status(200).send({
					message: 'No has comentado nada'
				});
			}
			if(validate_content){
			// Find and update de un subdocumento de un comentario
				Topic.findOneAndUpdate(
				{"comments._id": commentId},
				{
					"$set": {
						"comments.$.content": params.content
					} 
				},
				{new: true},
				(err, topicUpdated) => {
					if(err){
						return res.status(500).send({
							status: "error",
							message: 'Error en la peticón'
						});
					}
					if(!topicUpdated){
						return res.status(404).send({
							status: 'error',
							message: 'Error al actualizar el comentario'
						});
					}
					// Devolver los datos
					return res.status(200).send({
						status: "success",
						topic: topicUpdated

					});
				
				});
			}
 


	},

	delete: function(req, res){

		//Sacar el id del topic y del comentario a borrar 
		var topicId = req.params.topicId;
		var commentId = req.params.commentId;
		//Buscar el topic 
		Topic.findById(topicId, (err, topic) => {
			if(err){
				return res.status(500).send({
					status: "error",
					message: 'Error en la peticón'
				});
			}
			if(!topic){
				return res.status(404).send({
					status: 'error',
					message: 'Error al borrar el comentario'
				});
			}
			//Selecccionar el subcomentario (comentario)
			var comment = topic.comments.id(commentId); 
			//Borrar el comentario
			if(comment){
				comment.remove();
				//Guardar el topic 
				topic.save((err) =>{
					if(err){
						return res.status(500).send({
							status: "error",
							message: 'Error en la peticón'
						});
					}
					Topic.findById(topic._id)
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
				});

			}else{
				return res.status(404).send({
					status: 'error',
					message: 'No existe el comentario '
				});	
			}
			
		});
		
	},


};
 
module.exports = controller;