import cluster from 'cluster';
import * as http from 'http';
import { cpus } from 'os';
import IWorkerMessage from './interfaces/IWorkerMessage';
import redirectHandler from './lib/redirectHandler';
import server from './server';
import * as dotenv from 'dotenv';
import syncWorkers from './lib/syncWorkers';
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
                if (!cluster.workers) throw new Error('Cluster workers do not exist');
                if (msg.task === 'sync') syncWorkers(msg.data, cluster.workers, worker.id);
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

export default mainServer;
