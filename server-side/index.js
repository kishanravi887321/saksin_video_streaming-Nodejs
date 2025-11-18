import  app from './src/app.js';
import dotenv from 'dotenv';

dotenv.config({path:'../.env'});

const PORT = process.env.PORT || 3000;

const startServer = () => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
};

startServer();