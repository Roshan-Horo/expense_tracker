import * as winston from 'winston'
import { config } from '../config/config'

let logger: winston.Logger;

if(config.node_env === 'production'){

  // For production Server : No Logging at console and save into file in DIR - /var/log/applog 
  logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
  ),
  defaultMeta: { service: 'backend-api' },
  transports: [
    //
    // - Write to all logs with level `info` and below to `quick-start-combined.log`.
    // - Write all logs error (and below) to `quick-start-error.log`.
    //
    new winston.transports.File({ filename: '/var/log/applog/error.log', level: 'error' }),
    new winston.transports.File({ filename: '/var/log/applog/combined.log' })
  ]
  });

}else{

  // For any other Server : Log into console, don't save anything
  logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
    winston.format.colorize(),
    winston.format.simple()
  ),
  defaultMeta: { service: 'backend-api' },
  transports: [
    new winston.transports.Console()
  ]
}); 

}

export default logger