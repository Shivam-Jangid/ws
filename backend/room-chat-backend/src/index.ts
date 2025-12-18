import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8080});
// Maps roomName -> array of sockets
const map = new Map<string, WebSocket[]>();

// Maps socket -> roomName
const reverseMap = new Map();

wss.on("connection", (s) => {

    s.on("message", (data) => {
        const { room } = JSON.parse(data.toString());

        if (room) {
            // add socket to map
            const socketsArray = map.get(room) || [];
            socketsArray.push(s);
            map.set(room, socketsArray);

            // track reverse mapping
            reverseMap.set(s, room);
        }
    });

    s.on("close", () => {
        const room = reverseMap.get(s);

        if (room) {
            let socketsArray = map.get(room);

            if (socketsArray) {
                // remove ALL occurrences of s
                socketsArray = socketsArray.filter(socket => socket !== s);

                if (socketsArray.length === 0) {
                    // delete room if empty
                    map.delete(room);
                } else {
                    // update room with filtered sockets
                    map.set(room, socketsArray);
                }
            }

            // remove reverse mapping
            reverseMap.delete(s);
        }
    });
});
