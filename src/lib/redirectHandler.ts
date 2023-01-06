import * as http from 'http';
import { IncomingMessage, ServerResponse } from 'http';
import { cpus } from 'os';
import * as dotenv from 'dotenv';
dotenv.config();

const mainPort = Number(process.env.PORT || 5000);
let current = 1;

const redirectHandler = (req: IncomingMessage, res: ServerResponse) => {
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
    if (current >= cpus().length) {
        current = 1;
    } else {
        current += 1;
    }
};

export default redirectHandler;
