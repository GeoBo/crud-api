import { IncomingMessage } from 'http';

function getReqData(req: IncomingMessage) {
    return new Promise((resolve, reject) => {
        try {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', () => {
                const parsed = JSON.parse(body);
                resolve(parsed);
            });
        } catch (error) {
            reject(error);
        }
    });
}
export default getReqData;
