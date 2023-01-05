import initialUsers from './base/users';
import IUser from './interfaces/IUser';
import { v4 as uuidv4 } from 'uuid';

class Controller {
    private users = initialUsers;

    async getUsers() {
        return new Promise((resolve) => resolve(this.users));
    }

    async getUser(id: string) {
        return new Promise((resolve, reject) => {
            const user = this.users.find((user) => user.id === id);
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
            this.users.push(newUser);

            this.syncUsers();
            resolve(newUser);
        });
    }

    async updateUser(data: IUser) {
        return new Promise((resolve, reject) => {
            const user = this.users.find((user) => user.id === data.id);
            if (!user) {
                reject(`No user with id ${data.id} found`);
                return;
            }
            const { username, age, hobbies } = data;
            user.username = username;
            user.age = age;
            user.hobbies = hobbies;

            this.syncUsers();
            resolve(user);
        });
    }

    async deleteUser(id: string) {
        return new Promise((resolve, reject) => {
            const userIndex = this.users.findIndex((user) => user.id === id);
            if (userIndex === -1) {
                reject(`No user with id ${id} found`);
                return;
            }
            const user = { ...this.users[userIndex] };
            this.users.splice(userIndex, 1);

            this.syncUsers();
            resolve(user);
        });
    }

    setUsers(users: IUser[]) {
        this.users = users;
    }

    syncUsers() {
        if (!process.env['TASK_PORT']) return;
        console.log('worker send data');
        if (process.send) process.send({ task: 'sync', data: this.users });
    }
}

export default Controller;
