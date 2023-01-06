import IUser from './IUser';

export default interface IWorkerMessage {
    task: string;
    data: IUser[];
}
