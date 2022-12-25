import users from './base/users';
import IUser from './interfaces/IUser';
import { v4 as uuidv4 } from 'uuid';

class Controller {
    async getUsers() {
        return new Promise((resolve) => resolve(users));
    }

    async getUser(id: string) {
        return new Promise((resolve, reject) => {
            const user = users.find((user) => user.id === id);
            if (!user) {
                reject(`No user with id ${id} found`);
            }

            resolve(user);
        });
    }

    async createUser(user: Omit<IUser, 'id'>) {
        return new Promise((resolve) => {
            const newUser = {
                id: uuidv4(),
                ...user,
            };
            users.push(newUser);
            resolve(newUser);
        });
    }

    async updateUser(data: IUser) {
        return new Promise((resolve, reject) => {
            const user = users.find((user) => user.id === data.id);
            if (!user) {
                reject(`No user with id ${data.id} found`);
                return;
            }
            const { username, age, hobbies } = data;
            user.username = username;
            user.age = age;
            user.hobbies = hobbies;

            resolve(user);
        });
    }

    async deleteUser(id: string) {
        return new Promise((resolve, reject) => {
            const userIndex = users.findIndex((user) => user.id === id);
            if (userIndex === -1) {
                reject(`No user with id ${id} found`);
                return;
            }
            const user = { ...users[userIndex] };
            users.splice(userIndex, 1);

            resolve(user);
        });
    }
}

export default Controller;
