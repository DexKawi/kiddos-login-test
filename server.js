const Hapi = require('@hapi/hapi');
const admin = require('firebase-admin');
require('dotenv').config();

// Initialize Firebase Admin SDK
admin.initializeApp({
    credential: admin.credential.cert(require('./serviceAccountKey.json')),
});

const startServer = async () => {
    const server = Hapi.server({
        port: 3000,
        host: 'localhost',
    });

    // Routes
    server.route([
        // Sign-Up Route
        {
            method: 'POST',
            path: '/signup',
            handler: async (request, h) => {
                const { email, password } = request.payload;
                try {
                    const user = await admin.auth().createUser({ email, password });
                    return h.response({ uid: user.uid }).code(201);
                } catch (error) {
                    return h.response({ error: error.message }).code(400);
                }
            },
        },
        // Login Route
        {
            method: 'POST',
            path: '/login',
            handler: async (request, h) => {
                const { email, password } = request.payload;
                try {
                    const user = await admin.auth().getUserByEmail(email);
                    // Assuming you have front-end Firebase SDK to handle login
                    return h.response({ uid: user.uid }).code(200);
                } catch (error) {
                    return h.response({ error: error.message }).code(400);
                }
            },
        },
        // Verify Token Route
        {
            method: 'POST',
            path: '/verify',
            handler: async (request, h) => {
                const { token } = request.payload;
                try {
                    const decodedToken = await admin.auth().verifyIdToken(token);
                    return h.response({ uid: decodedToken.uid }).code(200);
                } catch (error) {
                    return h.response({ error: error.message }).code(401);
                }
            },
        },
    ]);

    await server.start();
    console.log(`Server running on ${server.info.uri}`);
};

startServer().catch((err) => {
    console.error(err);
    process.exit(1);
});