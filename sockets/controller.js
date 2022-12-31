const { Socket } = require("socket.io");
const { comprobarJWT } = require("../helpers");
const { ChatMesajes } = require("../models");



const chatMesajes = new ChatMesajes()


const socketController = async(socket = new Socket(), io) => {

    console.log('Cliente conectado');
    const token = socket.handshake.headers['x-token'];
    const usuario = await comprobarJWT(token);

    if(!usuario){
        return socket.disconnect();
    }

    console.log('Se conecto ' + usuario.nombre);

    chatMesajes.conectarUsuario(usuario);
    io.emit('usuarios-activos', chatMesajes.usuariosArr)
    socket.emit('recibir-mensajes', chatMesajes.ultimosDiez)

    socket.join(usuario.id);

    
    socket.on('disconnect', ()=>{
        chatMesajes.desconectarUsuario(usuario.id);
        io.emit('usuarios-activos', chatMesajes.usuariosArr)
    })
    
    socket.on('enviar-mensaje', ({mensaje, uid})=>{
        console.log(mensaje);
        console.log(uid);

        if(uid){
            socket.to(uid).emit('mensaje-privado',{de: usuario.nombre, mensaje})
        }else{
            chatMesajes.enviarMensaje(usuario.id, usuario.nombre, mensaje)
            io.emit('recibir-mensajes', chatMesajes.ultimosDiez);
            //chatMesajes.desconectarUsuario(usuario.id);
            //io.emit('usuarios-activos', chatMesajes.usuariosArr)
        }

    })


}


module.exports = {
    socketController
}