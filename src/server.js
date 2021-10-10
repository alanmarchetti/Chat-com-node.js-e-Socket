const express = require('express');
const socketIO = require('socket.io');
const http = require('http');
const path = require('path');
let connected_users = [];

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

server.listen(5000);

io.on('connection', (socket) => {
    console.log('conexão detectada!!');

    // - conectando e identificando o usuário
    socket.on('join-request', (username) => {
        socket.username = username;
        connected_users.push( username );

        socket.emit('users-success', connected_users);

        socket.broadcast.emit('list-update', {
            joined: username,
            list: connected_users
        });
    });

    // desconectando o usuário e devolvendo a list att para os demais
    socket.on('disconnect', () => {
        connected_users = connected_users.filter(user => user != socket.username);

        socket.broadcast.emit('list-update', {
            left: socket.username,
            list: connected_users
        });
    });

    // - enviando mensagem
    socket.on('send-message', (text) => {
        let msg = {
            username: socket.username,
            message: text
        };
        socket.broadcast.emit('show-message', msg);
    })

});

