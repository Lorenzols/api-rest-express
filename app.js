//ENTORNOS Debug
const inicioDebug = require('debug')('app:inicio');
const dbDebug = require('debug')('app:db')

const express = require('express');
const { send, redirect } = require('express/lib/response');
const Joi = require('joi');
const app = express();
const morgan = require('morgan')
const config = require('config');

//Logger
// const logger = require('./logger');


app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//configuración entornos
console.log('Aplicación: '+ config.get('nombre'))
console.log('DB server: '+ config.get('configDB.host'))

// app.use(logger);

app.use(function(req, res, next){
    console.log("Logging...");
    next();
})

//Uso de middleware morgan
app.use(morgan('tiny'))
// console.log("Morgan funcionando")
inicioDebug('Morgan funciona')


//Trabajos con la base de datos
dbDebug('Conenctando con la bd...')

const usuarios = [
    {id:1, nombre:'Lorenzo'},
    {id:2, nombre:'Ruben'},
    {id:3, nombre:'Ana'}
];

app.get('/', (req, res) => {
    res.send("Hola cococo");
});

app.get('/api/usuarios', (req, res) => {
    res.send(usuarios)
})

app.get('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id);
    if(!usuario) res.status(404).send('El usuario no existe');
    res.send(usuario);
})

app.post('/api/usuarios', (req, res) => {

    // let body = req.body
    // console.log(body.nombre)
    // res.json({body})

    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    const {error, value} = schema.validate({ nombre: req.body.nombre});

    if(!error){
        const usuario = {
        id: usuarios.length + 1,
            nombre: value.nombre
        };

        usuarios.push(usuario);
        res.send(usuario);
    }else{
        const mensaje = error.details[0].message
        res.status(404).send(mensaje);
    }

    // if(!req.body.nombre || req.body.nombre.length <= 2){
    //     res.status(404).send('Debe escribir un nombre, minimo tres letras.');
    //     return;
    // }

    // const usuario = {
    //     id: usuarios.length + 1,
    //     nombre: req.body.nombre
    // };

    // usuarios.push(usuario);
    // res.send(usuario);
})

app.put('/api/usuarios/:id', (req, res) =>{

    let usuario = existeUsuario(req.params.id)
    if(!usuario) res.status(404).send('El usuario no existe');

    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });

    const {error, value} = validarUsuario(req.body.nombre);

    if(error){
        const mensaje = error.details[0].message
        res.status(404).send(mensaje);
        return;
    }

    usuario.nombre = value.nombre;
    res.send(usuario);
})

app.delete('/api/usuarios/:id', (req, res) => {
    let usuario = existeUsuario(req.params.id)
    if(!usuario) res.status(404).send('El usuario no existe');

    const index = usuarios.indexOf(usuario)
    usuarios.splice(index, 1)

    res.send(usuario)
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Escuchando en el puerto ${port}...`)
})

function existeUsuario(id){
    return (usuarios.find(u => u.id === parseInt(id)));
}

function validarUsuario(nom){
    const schema = Joi.object({
        nombre: Joi.string().min(3).required()
    });
    return (schema.validate({ nombre: nom}))
}