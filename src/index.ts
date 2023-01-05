import cluster from 'cluster';
import * as http from 'http';
import { cpus } from 'os';
import IUser from './interfaces/IUser';
import IWorkerMessage from './interfaces/IWorkerMessage';
import redirectHandler from './lib/redirectHandler';
import server from './server';
import * as dotenv from 'dotenv';
dotenv.config();

const mainPort = Number(process.env.PORT || 5000);

let mainServer = server; //export server for testing

if (process.env.SERVER_MODE === 'cluster') {
    if (cluster.isPrimary) {
        console.log(`Primary ${process.pid} is running`);

        mainServer = http.createServer(redirectHandler);
        mainServer.listen(mainPort);

        for (let i = 1; i <= cpus().length; i += 1) {
            const worker = cluster.fork({ TASK_PORT: mainPort + i });
            worker.on('message', (msg: IWorkerMessage) => {
                if (msg.task === 'sync') syncWorkers(msg.data, worker.id);
            });
        }
    } else if (cluster.isWorker) {
        console.log(`Worker ${process.pid} is running`);
        const workerPort = process.env['TASK_PORT'];
        server.listen(workerPort);
    }
} else {
    if (process.env.NODE_ENV !== 'test') mainServer.listen(mainPort);
}

function syncWorkers(data: IUser[], id: number) {
    for (const worker of Object.values(cluster.workers || [])) {
        if (worker?.id === id) continue;
        console.log('main send to worker: ' + worker?.id);
        worker?.send({ task: 'sync', data });
    }
}

export default mainServer;
