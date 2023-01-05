import { createServer, IncomingMessage, ServerResponse } from 'http';
import Controller from './controllers';
import IWorkerMessage from './interfaces/IWorkerMessage';
import getReqData from './lib/getReqData';
import { isUserData } from './lib/isUserData';
import isUUID from './lib/isUUID';

const controller = new Controller();

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
        //Get users
        if (req.url === '/api/users' && req.method === 'GET') {
            const users = await controller.getUsers();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(users));
        }
        //Get user
        else if (req.url?.match(/\/api\/users\/([0-9a-fA-F]+)/) && req.method === 'GET') {
            const id = req.url.split('/')[3];

            if (!isUUID(id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'UserId is invalid' }));
                return;
            }
            try {
                const user = await controller.getUser(id);
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error }));
            }
        }
        //Create user
        else if (req.url === '/api/users' && req.method === 'POST') {
            try {
                const data = await getReqData(req);
                if (!isUserData(data)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Request body does not contain required fields' }));
                    return;
                }
                const user = await controller.createUser(data);
                res.writeHead(201, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(user));
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error }));
            }
        }

        //Update user
        else if (req.url?.match(/\/api\/users\/([0-9a-fA-F]+)/) && req.method === 'PUT') {
            const id = req.url.split('/')[3];
            if (!isUUID(id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'UserId is invalid' }));
                return;
            }
            try {
                const data = await getReqData(req);
                if (!isUserData(data)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Request body does not contain required fields' }));
                    return;
                }
                const updatedUser = await controller.updateUser({ id, ...data });
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(updatedUser));
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error }));
            }
        }
        //Delete user
        else if (req.url?.match(/\/api\/users\/([0-9a-fA-F]+)/) && req.method === 'DELETE') {
            const id = req.url.split('/')[3];
            if (!isUUID(id)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'UserId is invalid' }));
                return;
            }
            try {
                const deletedUser = await controller.deleteUser(id);
                res.writeHead(204, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify(deletedUser));
            } catch (error) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: error }));
            }
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Route not found' }));
        }
    } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Internal Server Error' }));
    }
    console.log(process.env['TASK_PORT']);
});

process.on('message', (msg: IWorkerMessage) => {
    console.log('worker get data');
    if (msg.task === 'sync') controller.setUsers(msg.data);
});

// if (process.env.NODE_ENV !== 'test') {
//     server.listen(PORT, () => {
//         console.log(`server started on port: ${PORT}`);
//     });
// }

export default server;
