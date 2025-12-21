import express from "express";
import { WebSocketServer } from "ws";
const app = express();
const PORT = 3000;
const server = app.listen(PORT);


const wss = new WebSocketServer({noServer:true});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request,socket, head, socket =>{
        wss.emit('connection', socket, request);
    })
})

wss.on('connection', (socket) =>{
    socket.on('open', () =>{
        console.log('connection is to be opened');
    })
    socket.send("connected to the web socket server");
})