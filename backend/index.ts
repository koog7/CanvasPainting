import express from 'express';
import expressWs from "express-ws";
import cors from 'cors';
import WebSocket from 'ws';

const app = express();
expressWs(app)

const port = 8000;

app.use(cors())

const router = express.Router();

const userData: WebSocket[] = [];
const fieldData: string[] = [];
router.ws('/paint', (ws, req) => {
    userData.push(ws)

    fieldData.forEach((message) => {
        ws.send(message);
    });

    ws.on('message' , (message:string) => {
        fieldData.push(message);

        userData.forEach((clientWs) => {
            clientWs.send(message)
        })
    })

    ws.on('close' , () => {
        const index = userData.indexOf(ws)
        userData.splice(index , 1)
    })
});

app.use(router);

app.listen(port, () => {
    console.log(`Server started on ${port} port!`);
});

