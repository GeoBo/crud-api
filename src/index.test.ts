import * as request from 'supertest';
import app from './server';
import IUser from './interfaces/IUser';
import isUUID from './lib/isUUID';

describe('API testing: CRUD', () => {
    let user: IUser;

    const userBody: Omit<IUser, 'id'> = {
        username: 'Jack',
        age: 30,
        hobbies: ['dancing'],
    };

    it('Request: get all users -> response: 200 empty array', async () => {
        await request(app).get('/api/users').expect(200, []);
    });

    it('Request: сreate new user with UUID -> response: 201 created user', async () => {
        await request(app)
            .post('/api/users')
            .send(userBody)
            .expect(201)
            .then((res) => {
                user = res.body;
                const id = user.id;
                expect(isUUID(id)).toBeTruthy;
                const checkUser = { ...userBody, id };
                expect(checkUser).toEqual(user);
            });
    });

    it('Request: get user -> response: 200 newly created user', async () => {
        await request(app).get(`/api/users/${user.id}`).expect(200, user);
    });

    it('Request: update user -> response: newly updated user', async () => {
        userBody.age = 18;
        userBody.hobbies.push('jumping');
        user.age = 18;
        user.hobbies.push('jumping');
        await request(app).put(`/api/users/${user.id}`).send(userBody).expect(200, user);
    });

    it('Request: delete user -> response: 200 - empty string', async () => {
        await request(app).delete(`/api/users/${user.id}`).expect(204, '');
    });

    it('Request: get user -> response: 404 newly deleted user not found', async () => {
        const errorMessage = { message: `No user with id ${user.id} found` };
        await request(app).get(`/api/users/${user.id}`).expect(404, errorMessage);
    });
});

describe('API testing: errors', () => {
    const wrongUser = {
        id: '1234',
        username: 'Jack',
    };

    it('Request: non-existent route -> response: 404', async () => {
        const errorMessage = { message: `Route not found` };
        await request(app).get('/api').expect(404, errorMessage);
    });

    it('Request: create user with wrong body -> response: 400', async () => {
        const errorMessage = { message: `Request body does not contain required fields` };
        await request(app).post(`/api/users`).send(wrongUser).expect(400, errorMessage);
    });

    it('Request: get user by wrong id -> response: 400', async () => {
        const errorMessage = { message: `UserId is invalid` };
        await request(app).get(`/api/users/1234`).expect(400, errorMessage);
    });
});

describe('API testing: multiple users', () => {
    let user1: IUser, user2: IUser, user3: IUser;

    const userBody1: Omit<IUser, 'id'> = {
        username: 'Jack',
        age: 30,
        hobbies: ['dancing'],
    };

    const userBody2: Omit<IUser, 'id'> = {
        username: 'Mike',
        age: 20,
        hobbies: ['tennis'],
    };

    const userBody3: Omit<IUser, 'id'> = {
        username: 'Yuri',
        age: 10,
        hobbies: ['guitar'],
    };

    it('Request: сreate new user -> response: 201 created user', async () => {
        await request(app).post('/api/users').send(userBody1).expect(201);
        await request(app).post('/api/users').send(userBody2).expect(201);
        await request(app).post('/api/users').send(userBody3).expect(201);
    });

    it('Request: get users -> response: 3 users', async () => {
        await request(app)
            .get('/api/users')
            .expect(200)
            .then((res) => {
                expect(res.body).toHaveLength(3);
                user1 = res.body[0];
                user2 = res.body[1];
                user3 = res.body[2];
            });
    });

    it('Request: update user -> response: 200', async () => {
        userBody1.age = 18;
        userBody2.age = 18;
        userBody3.age = 18;
        user1.age = 18;
        user2.age = 18;
        user3.age = 18;
        await request(app).put(`/api/users/${user1.id}`).send(userBody1).expect(200);
        await request(app).put(`/api/users/${user2.id}`).send(userBody2).expect(200);
        await request(app).put(`/api/users/${user3.id}`).send(userBody3).expect(200);
    });

    it('Request: delete 2 users -> response: 204', async () => {
        await request(app).delete(`/api/users/${user1.id}`).expect(204);
        await request(app).delete(`/api/users/${user2.id}`).expect(204);
    });

    it('Request: get 3th user -> response: 200', async () => {
        await request(app)
            .get(`/api/users/${user3.id}`)
            .expect(200)
            .then((res) => {
                expect(res.body).toEqual(user3);
            });
    });
});
