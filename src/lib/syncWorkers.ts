import IUser from '../interfaces/IUser';

function syncWorkers(data: IUser[], workers: NodeJS.Dict<import('cluster').Worker>, senderWorkerID: number) {
    for (const worker of Object.values(workers || [])) {
        if (worker?.id === senderWorkerID) continue;
        console.log('main send to worker: ' + worker?.id);
        worker?.send({ task: 'sync', data });
    }
}

export default syncWorkers;
