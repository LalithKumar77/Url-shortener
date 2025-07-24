import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import urlRoute from './routes/url.js';
import cors from 'cors';
import connectDB from './db/db.js';
import path from 'path';

const app = express();
const PORT = 3000 || process.env.PORT ;

app.use(cors());
app.use(express.json());
connectDB();

app.use((req, res, next) => {
    console.log(`Received request: ${req.method} ${req.url}`);
    next();
});

// app.get('/', (req, res) => {
//     return res.send('Welcome to URL Shortener');
// });

app.use('/', urlRoute);

const __dirname = path.resolve();
app.use(express.static(path.join(__dirname, 'dist')));

app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});