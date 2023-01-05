import { IncomingMessage } from 'http';

function getReqData(req: IncomingMessage) {
    return new Promise((resolve, reject) => {
        try {
            let body = '';

            req.on('data', (chunk) => {
                body += chunk.toString();
            });

            req.on('end', () => {
                if (!body) reject('Empty request body');
                else {
                    const parsed = JSON.parse(body);
                    resolve(parsed);
                }
            });
        } catch (error) {
            reject(error);
        }
    });
}
export default getReqData;
