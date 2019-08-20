/*jshint esversion: 6 */
var express = require('express');
var http = require('http');
var socketio = require('socket.io');
var mongojs = require('mongojs');

var ObjectID = mongojs.ObjectID;
var db = mongojs(proccess.env.MONGO_URL || 'mongodb://localhost:27017/local');
var app = express();
var server = http.server(app);
var websocket = socketio(server);
server.listen(3600, () => console.log('listening on port 3600'));


var clients = {};
var users = {};

var chatId = {};

websocket.on('connection', (socket) => {
    clients[socket.id] = socket;
    socket.on('userJoined', (userId) => onUserJoined(userId, socket));
    socket.on('message', (message) => onMessageReceive(message, socket));
});

function onUserJoined(userID, socket) {
    try {
        if (!userID) {
            var user = db.collection('user').insert({}, (err, user) => {
                socket.emit('userJoined', user._id);
                users[socket.id] = user._id;
                _sendExistingMessage(socket);
            });
        } else {
            users[socket.id] = userID;
            _sendExistingMessage(socket);
        }
    } catch (error) {
        console.log(error);
    }
}

function onMessageReceive(message, socket) {
    var userID = users[senderSocket.id];
    if (!userID)
        return;

    _sendAndSaveMessage(message, senderSocket);
}

function _sendExistingMessage(socket) {
    var messages = db.collection('messages')
        .find({ chatId })
        .sort({ createdAt: 1 })
        .toArray((err, messages) => {
            if (!messages.length)
                return;
            socket.emit('message', messages.reverse());
        });
}

function _sendAndSaveMessage(message, senderSocket) {
    var messageData = {
        text: message.text,
        user: message.user,
        createdAt: new Date(message.createdAt),
        chatId: chatId
    };

    db.collection('messages').insert(messageData, (err, message) => {
        var emmiter = fromServer ? websocket : socket.broadcast;
        emmiter.emit('message', [message]);
    });

    var stdin = process.openStdin();
    stdin.addListener('data', function(d) {
        _sendAndSaveMessage({
            text: d.toString().trim(),
            createdAt: new Date(),
            user: { id: 'robot' }
        });
    }, null, true);
}