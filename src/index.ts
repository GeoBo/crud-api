import cluster from 'cluster';
import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { cpus } from 'os';
import IUser from './interfaces/IUser';
import IWorkerMessage from './interfaces/IWorkerMessage';
import server from './server';
import * as dotenv from 'dotenv';
dotenv.config();

const mainPort = Number(process.env.PORT || 5000);
let current = 1;
let mainServer = server;

if (process.env.SERVER_MODE === 'cluster') {
    if (cluster.isPrimary) {
        console.log(`Primary ${process.pid} is running`);
        const redirectHandler = (req: IncomingMessage, res: ServerResponse) => {
            // console.log('redirectHandler: ' + req.url);
            if (req.url === '/favicon.ico') {
                res.writeHead(204);
                res.end();
                return;
            }
            const request = http.request({ ...req, path: req.url, port: mainPort + current }, (response) => {
                res.writeHead(response.statusCode || 500, response.headers);
                response.pipe(res, { end: true });
            });
            req.pipe(request, { end: true });
            //request.end();
            if (current >= cpus().length - 1) {
                current = 1;
            } else {
                current += 1;
            }
        };
        mainServer = http.createServer(redirectHandler);
        mainServer.listen(mainPort);

        for (let i = 1; i <= cpus().length - 1; i += 1) {
            const worker = cluster.fork({ TASK_PORT: mainPort + i });
            worker.on('message', (msg: IWorkerMessage) => {
                console.log(msg);
                if (msg.task === 'sync') syncWorkers(msg.data);
            });
        }
    } else if (cluster.isWorker) {
        console.log(`Worker ${process.pid} is running`);
        const workerPort = process.env['TASK_PORT'];
        server.listen(workerPort);
    }
} else {
    mainServer = server.listen(mainPort);
}

function syncWorkers(data: IUser[]) {
    for (const worker of Object.values(cluster.workers || [])) {
        console.log('main send to worker: ' + worker);
        worker?.send({ task: 'sync', data });
    }
}

export default mainServer;
