import IUser from '../interfaces/IUser';

const isUserData = (data: unknown): data is Omit<IUser, 'id'> =>
    data !== null &&
    typeof data === 'object' &&
    'username' in data &&
    'age' in data &&
    'hobbies' in data &&
    Object.keys(data).length === 3;

export { isUserData };
