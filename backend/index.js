import dotenv from 'dotenv';
dotenv.config(
    {
        override:true,
        path:'./.env'
    }
);
import express from 'express';
import urlRoute from './routes/url.js';
import cors from 'cors';
import connectDB from './db/db.js';
import path from 'path';
import morganLogger from './middlewares/morganLogger.js';
import authRoute from './routes/authRoute.js';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import userRouter from "./routes/userRoute.js"

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5000',
].filter(Boolean);
app.use(cors(
    {
        origin: allowedOrigins,
        credentials: true,
    }
));
app.use(helmet({}));
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());
app.use(morganLogger);
app.use(express.urlencoded({ extended: true, limit: '5mb' }));
connectDB();

// app.use((req, res, next) => {
//     console.log(`Received request: ${req.method} ${req.url}`);
//     next();
// });

app.use((req, res, next) => {
    console.log('--- Incoming Request ---');
    // console.log('Method:', req.method);
    // console.log('URL:', req.url);
    console.log('Headers:', req.headers.cookie);
    // console.log('Query:', req.query);
    // console.log('Params:', req.params);
    console.log('Body:', req.body);
    console.log('------------------------');
    next(); // Move to next middleware or route
});

app.get('/', (req, res) => {
    console.log(`User Agent: ${req.headers['user-agent']}`);
    return res.send('Welcome to URL Shortener');
});
// const __dirname = path.resolve();
// app.use(express.static(path.join(__dirname, 'dist')));

// app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
// });



app.use('/', urlRoute);
app.use('/api/auth', authRoute);
app.use('/api', userRouter);




app.use((err, req, res, next) => {
    console.error(err.stack);
    return res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});