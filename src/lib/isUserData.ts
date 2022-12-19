import IUser from '../interfaces/IUser';

const isUserData = (data: unknown): data is Omit<IUser, 'id'> =>
    typeof data === 'object' && data !== null && 'username' in data && 'age' in data && 'hobbies' in data;

export { isUserData };
