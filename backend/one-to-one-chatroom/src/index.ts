import { WebSocketServer, WebSocket } from "ws";

const wss = new WebSocketServer({ port: 8080 });

const map = new Map<string, WebSocket>();
const reverseMap = new Map<WebSocket, string>();

wss.on("connection", (s) => {

    s.on("message", (e) => {
        const jargon = e.toString();

        try {
            const jargonJson = JSON.parse(jargon);

            if (jargonJson.type == "join") {
                const id = jargonJson.id;
                if (!id) {
                    s.send("sendersId required for join");
                    return;
                }
                const currSock = map.get(id);

                if(currSock){
                    s.send('user with id:' + id + ' exists');
                    return;
                }
                map.set(id, s);
                reverseMap.set(s, id);

                s.send(`joined successfully with id ${id}`);
            }

            else if (jargonJson.type == "message") {
                const rId = jargonJson.recieversId;
                const message = jargonJson.message;

                if (!rId || !message) {
                    s.send("recieversId and message required");
                    return;
                }

                const rSocket = map.get(rId);

                if (rSocket) {
                    rSocket.send(message);
                } else {
                    s.send(`receiver: '${rId}' not found`);
                }
            }
            else {
                s.send("unknown event type");
            }
        }
        catch (err) {
            s.send("invalid request format. Expected JSON.");
        }
    });


    s.on("close", () => {
        const uId = reverseMap.get(s);

        if (uId) {
            map.delete(uId);
            reverseMap.delete(s);
            console.log(`client with id ${uId} disconnected and removed`);
        }
    });

});
