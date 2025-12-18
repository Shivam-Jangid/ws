import { WebSocket, WebSocketServer } from "ws";

const wss = new WebSocketServer({port:8080});

const map = new Map<string, WebSocket[]>();

wss.on("connection", (s)=>{
    s.on("message", (e) => {
        const mes = e.toString();
        const mesJson = JSON.parse(mes);

        if(mesJson.type == "join"){
            const room = mesJson.room;
            const sArray = map.get(room);
            if(sArray){
                sArray.push(s);
                s.send("the length of the socket array is : "+ sArray.length);
            }
            else{
                const newWebSocketArray:WebSocket[] = [];
                newWebSocketArray.push(s);
                map.set(room, newWebSocketArray);
                const arr = map.get(room);

                s.send("the length of the newly created array is : "+arr?.length);
            }
        }

        else if(mesJson.type == "message"){
            const room = mesJson.room;
            const sarr = map.get(room);
            if(sarr){
                for(let i=0; i<sarr.length; i++){
                    const currentSocket = sarr[i];
                    if(currentSocket!=s){
                        currentSocket.send(mesJson.message);
                    }
                }
            }

            else{
                console.log(mesJson.message);
                s.send("no joinees in this room");
            }
        }

    })
})

