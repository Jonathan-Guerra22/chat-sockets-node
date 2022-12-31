const url = 'http://localhost:8080/api/auth/'


let usuario = null;
let socket = null;


const txtUid = document.querySelector('#txtUid');
const txtMensage = document.querySelector('#txtMensage');
const ulUsuarios = document.querySelector('#ulUsuarios');
const ulMensajes = document.querySelector('#ulMensajes');
const btnSalir = document.querySelector('#btnSalir');



const validarJWT = async () => {

    const token = localStorage.getItem('token') || '';

    if (token <= 10) {
        window.location = 'index.html'
        //localStorage.removeItem('token')
        throw new Error('No hay token')
    }

    const resp = await fetch(url, {
        headers: {
            'x-token': token
        }
    })

    const { usuario: userDB, token: tokenDB } = await resp.json();

    // console.log("user");
    // console.log(userDB);
    // console.log("token");
    // console.log(tokenDB);

    localStorage.setItem('token', tokenDB);
    usuario = userDB;
    document.title = usuario.nombre;

    await conectarSocket();
}


const conectarSocket = async () => {

    socket = io({
        'extraHeaders': {
            'x-token': localStorage.getItem('token')
        }
    });


    socket.on('connect', () => {
        console.log('Socket Online');
    })

    socket.on('disconnect', () => {
        console.log('Socket offline');
    })

    socket.on('recibir-mensajes', (payload) => {
        console.log(payload);
        dibujarMensajes(payload)
    })
    socket.on('usuarios-activos', (payload) => {
        console.log(payload);
        dibujarUsuarios(payload)
    })
    socket.on('mensaje-privado', (payload) => {
        console.log('Privado' ,  payload);
    })

}



const dibujarUsuarios = (usuarios = []) => {
    let usersHtml = ''

    usuarios.forEach(({nombre, uid}) => {
        usersHtml += `
        <li>
            <p>
                <h5 class="text-success">${nombre}</h5>
                <span class="fs-6 text-muted">${uid}</span>
            </p>
        </li>
        `
    })

    ulUsuarios.innerHTML = usersHtml
}


txtMensage.addEventListener('keyup', ({keyCode}) =>{
    if(keyCode!==13){return;}
    
    const mensaje = txtMensage.value;
    const uid = txtUid.value;
    
    if(mensaje.length === 0){return;}

    socket.emit('enviar-mensaje', {mensaje, uid})

    txtMensage.value = '';

})

const dibujarMensajes = (mensajes = []) => {
    let mensajesHtml = ''

    mensajes.forEach(({nombre, mensaje}) => {
        mensajesHtml += `
        <li>
            <p>
                <span class="text-primary">${nombre}: </span>
                <span >${mensaje}</span>
            </p>
        </li>
        `
    })

    ulMensajes.innerHTML = mensajesHtml;
}

const main = async () => {

    await validarJWT();

}

main();


