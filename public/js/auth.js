const url = 'http://localhost:8080/api/auth'

const miFormulario = document.querySelector('form');


miFormulario.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const formData = {}

    for (let e of miFormulario.elements) {
        if (e.name.length > 0) {
            formData[e.name] = e.value;
        }
    }

    fetch(url + '/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(resp => resp.json())
        .then(({ msg, token }) => {
            if (msg) {
                return console.error(msg)
            }
            localStorage.setItem('token', token);
            window.location = 'chat.html';
        })
        .catch(console.warn());

})




function handleCredentialResponse(response) {

    //console.log('token');
    //console.log(response.credential);

    const body = { id_token: response.credential }

    fetch(url + '/google', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(resp => resp.json())
        .then(({ token }) => {
            localStorage.setItem('token', token);
            window.location = 'chat.html';
        })
        .catch(console.warn());
}

const button = document.getElementById('google_signout');

button.onclick = () => {

    google.accounts.id.disableAutoSelect();

    google.accounts.id.revoke(localStorage.getItem('email'), done => {
        localStorage.clear();
        location.reload();
    })

}

