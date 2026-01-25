import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
// import connectDB from './config/db.config.js';
import userRoutes from './routes/user.routes.js';
import authRoutes from './routes/auth.routes.js';
import thaliRoutes from './routes/thalis.routes.js';
import messRoutes from './routes/mess-config.routes.js';
import intentRoutes from './routes/intents.routes.js';
// import pool from './config/db.config.js'
dotenv.config();

const app = express();
app.use(cors ({
    origin: '*', // Frontend URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true // Allow cookies or credentials if needed
  }));
app.use(express.json());



app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/thalis', thaliRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/intents', intentRoutes);


export default app;
