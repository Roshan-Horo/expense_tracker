import express from 'express'
import http from 'http'
import fs from 'fs'
import mongoose from 'mongoose'
import { config } from './config/config'
import logger from './library/Logging'

// Importing Routes
import userRoutes from './routes/userRoutes'
import userAccountRoutes from './routes/userAccountRoutes'

const app = express();

// Connect to Mongo

mongoose.set('strictQuery', false);
mongoose
  .connect(config.mongo.url)
  .then(() => { 
    logger.info({ message: "Mongo Successfully Connected"})
    startServer();
  })
  .catch((err) => {
    logger.error({ message: "Error while connecting MongoDB"});
    logger.error({message: err})
  })

// Start the server if Mongo Conneted

const startServer = () => {
    app.use((req, res, next) => {
      //  Log the REquest

       logger.info({ message: `Incomming -> method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`})

       res.on('finish', () => {
          // Log the Response
                //  Logging.info(`Incomming -> method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`);

          logger.info({ message: `Incomming -> method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status: [${res.statusCode}]`})
       })

       next();
    });

    app.use(express.urlencoded({ extended: true}));
    app.use(express.json());

    /** Rules of our Api */
    app.use( (req,res,next) => {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');

      if(req.method == 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({})
      }

      next();
    });

    /** Routes */

    app.use('/et/user', userRoutes)
    app.use('/et/useraccount', userAccountRoutes)

    /** Server Healthcheck */
    app.get('/et/ping', (req,res,next) => res.status(200).json({ message: 'pong'}));

    /** Error handling : if none of the routes are mattching */
    app.use( (req,res, next) => {
      const error = new Error('Route Not Found');
      logger.error({ message: error});

      return res.status(404).json({ message: error.message})
    });

    http.createServer(app).listen(config.server.port, () => logger.info(`Server is running on PORT ${config.server.port}`))
};