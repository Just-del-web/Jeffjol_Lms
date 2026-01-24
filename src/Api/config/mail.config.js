import { Resend } from 'resend';
import config from './secret.config.js';

const resend = new Resend(config.RESEND_API_KEY);

export default resend;
