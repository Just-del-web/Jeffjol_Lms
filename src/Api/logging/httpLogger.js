import morgan from "morgan";
import logger from './logger.js'; 


const CustomFormat = ((tokens, req, res) => {
  return JSON.stringify({
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    contentLength: tokens.res(req, res, 'content-length'),
    responseTime: Number(tokens['response-time'](req, res)),
    date: tokens.date(req, res, 'iso'),
    remoteAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.ip || req.socket.remoteAddress,
    userAgent: req.headers['user-agent'],
    
  });
});

const httpLogger = morgan(CustomFormat, {
  stream: {
    write: (message) => {
     try{
      const logData = JSON.parse(message);
      logger.info("HTTP Request", logData);

     }catch(err){
       logger.error(`Error logging HTTP request: ${err.message}`);
     }
      
    
    },
  },
});

export default httpLogger;
