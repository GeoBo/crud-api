import { IncomingMessage } from 'http';

function getReqData(req: IncomingMessage) {
    return new Promise((resolve, reject) => {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsed = JSON.parse(body);
                resolve(parsed);
            } catch (e) {
                reject('Invalid JSON parsing');
            }
        });

        req.on('error', (error: Error) => {
            reject(error);
        });
    });
}
export default getReqData;
