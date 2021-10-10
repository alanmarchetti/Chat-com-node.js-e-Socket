const socket = io();
let user_name = '';
let user_list = [];

const loginPage = document.querySelector('#login-page');
const chatPage = document.querySelector('#chat-page');

const loginInput = document.querySelector("#loginNameInput");
const chatInput = document.querySelector("#chatTextInput");

loginPage.style.display = 'flex';
chatPage.style.display = 'none';

function renderUserList() {
    let ul = document.querySelector('.user-list');
    ul.textContent = '';

    user_list.forEach(user => {
        ul.innerHTML += `<li>${user}</li>`
    });
}

function addMessage(type, user, message) {
    let ul = document.querySelector('.chat-list');
    switch (type) {
        case 'status':
            ul.innerHTML += `<li class="m-status">${message}</li>`
            break;
        case 'message':
            if (user_name == user) {
                ul.innerHTML += `<li class="m-text"><span class="me">${user}</span>${message}</li>`
            } else {
                ul.innerHTML += `<li class="m-text"><span>${user}</span>${message}</li>`
            }
            break;
    }
    ul.scrollTo = ul.scrollHeight;
}

loginInput.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
        let name = loginInput.value.trim();
        if (name != '') {
            user_name = name;
            document.title = `Chat ${user_name}`;
            socket.emit('join-request', user_name);
        }
    }
});

chatInput.addEventListener('keyup', (event) => {
    if (event.keyCode === 13) {
        let text = chatInput.value.trim();
        chatInput.value = '';

        if (text != '') {
            addMessage('message', user_name, text)
            socket.emit('send-message', text);
        }
    }
})

socket.on('users-success', (list) => {
    loginPage.style.display = 'none';
    chatPage.style.display = 'flex';
    chatInput.focus();

    addMessage('status', null, 'Conectado!')

    user_list = list;
    renderUserList();
});

socket.on('list-update', (data) => {
    if (data.joined) {
        addMessage('status', null, data.joined + ' entrou no chat')
    }
    if (data.left) {
        addMessage('status', null, data.left + ' saiu do chat')
    }
    user_list = data.list;
    renderUserList();
});

socket.on('show-message', (data) => {
    addMessage('message', data.username, data.message);
});

socket.on('disconnect', () => {
    addMessage('status', null, 'Você foi desconectado');
    user_list = [];
    renderUserList();
});

socket.on('connect_error', () => {
    addMessage('status', null, 'Tentando reconectar....')
});

socket.on('connect', () => {
    addMessage('status', null, 'Reconectado...');
    if (user_name != '') {
        socket.emit('join-request', user_name);
    }
})