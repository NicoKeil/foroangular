'use strict'

var mongoose = require('mongoose');
var app = require('./app');
var port = process.env.PORT || 3900;

mongoose.set('useFindAndModify', false)
		.set('useUnifiedTopology', true);

//Conectarce a la base de datos
mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost:27017/api_rest_node', { useNewUrlParser: true })
		.then(() => {
			console.log('La coneccion se ha realizado!!!');

			//Crear el servidor
			app.listen(port, () => {
				console.log('El servidor http://localhost:3999 esta funcionando!!');
			});
		})
		.catch(error => console.log(error));