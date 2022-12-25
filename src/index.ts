import { createServer, IncomingMessage, ServerResponse } from 'http';
import Controller from './controllers';
import getReqData from './lib/getReqData';
import { isUserData } from './lib/isUserData';
import isUUID from './lib/isUUID';
import * as dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 5000;

const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
    try {
        //Get users
        if (req.url === '/api/users' && req.method === 'GET') {
            const users = await new Controller().getUsers();
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
                const user = await new Controller().getUser(id);
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
                const user = await new Controller().createUser(data);
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
                const updatedUser = await new Controller().updateUser({ id, ...data });
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
                const deletedUser = await new Controller().deleteUser(id);
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
});

if (process.env.NODE_ENV !== 'test') {
    server.listen(PORT, () => {
        console.log(`server started on port: ${PORT}`);
    });
}

export default server;
