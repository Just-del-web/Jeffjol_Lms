import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import dotenv from 'dotenv';
import { Logtail as CoreLogtail } from '@logtail/node'; 
import { LogtailTransport } from '@logtail/winston';
import config from '../config/secret.config.js';


dotenv.config();

const LOGTAIL_TOKEN = config.LOGTAIL_TOKEN;
const LOGTAIL_HOST = config.LOGTAIL_HOST;
const isProduction = config.NODE_ENV === 'production';

const options = {
    file: {
        level: 'info',
        filename: './logs/app.log',
        handleExceptions: true,
        json: true,
        maxsize: 5242880, 
        maxFiles: 5,
        colorize: true,
    },
    console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true,
    },
};

const dailyErrorTransport = new DailyRotateFile({
    filename: './logs/error-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
        winston.format.timestamp(), 
        winston.format.json()
       
    ),
});

const dailyInfoTransport = new DailyRotateFile({
    filename: './logs/app-%DATE%.log',
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '14d',
    format: winston.format.combine(
        winston.format.timestamp(), 
        winston.format.json()
    ),
});


const transports = [
    new winston.transports.File({
        ...options.file,
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
        ),
    }),
    new winston.transports.Console({
        ...options.console,
        format: winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf((info) => {
                const { timestamp, level, message, metadata = {}, service } = info;
                const serviceTag = service ? `[${service}]` : '';
                let metadataString = '';
                if (metadata && typeof metadata === 'object' && Object.keys(metadata).length > 0) {
                   try {
                     
                     metadataString = ` ${JSON.stringify(metadata)}`;
                   } catch (e) {
                     metadataString = ' [Unstringifiable Metadata]';
                   }
                }
                return `${timestamp} ${level}${serviceTag}: ${message}${metadataString}`;
            })
        ),
    }),
    dailyErrorTransport,
    dailyInfoTransport,
];

if (isProduction && LOGTAIL_TOKEN && LOGTAIL_HOST) {
    try {
        const coreLogtailClient = new CoreLogtail(LOGTAIL_TOKEN, {
             endpoint: LOGTAIL_HOST
             
        });

        const logtailWinstonTransport = new LogtailTransport(coreLogtailClient, {
            level: 'info', 
            handleExceptions: true, 
            format: winston.format.combine(
                 winston.format.timestamp(), 
                 winston.format((info) => { 
                    info.app = 'nativeearn-backend';
                    info.environment = process.env.NODE_ENV;
                    return info;
                 })(),
                 winston.format.json() 
            )
        });

        transports.push(logtailWinstonTransport);
        console.log("Logtail transport successfully configured and added for production.");

    } catch (logtailError) {
        console.error("CRITICAL: Failed to initialize Logtail transport:", logtailError);
        
    }
} else if (isProduction) {
    console.warn("Logtail token or host not found in environment variables. Logtail transport not added.");
}


const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        winston.format.errors({ stack: true }), 
        winston.format.splat(),
        winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] })
    ),
    transports,
    exitOnError: false, 
});

dailyErrorTransport.on('rotate', (oldFilename, newFilename) => {
    logger.info('Error log rotated', { oldFilename, newFilename });
});
dailyInfoTransport.on('rotate', (oldFilename, newFilename) => {
    logger.info('Info log rotated', { oldFilename, newFilename });
});

logger.stream = {
    write: (message) => {
        
        if (message && message.trim().length > 0) {
            logger.info(message.trim()); 
        }
    },
};

logger.transports.forEach((transport) => {
    transport.on('error', (error) => {
        const transportName = transport.constructor ? transport.constructor.name : 'UnknownTransport';
        console.error(`Log Transport Error (${transportName}):`, error);
       
    });
});

logger.on('error', (error) => {
    console.error('Logger internal error:', error);
});

setImmediate(() => {
    logger.info('Logger initialized successfully.');
});

export default logger;

