import morgan from 'morgan';
import chalk from 'chalk';

morgan.token('statusColor', (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return chalk.red(status);
  if (status >= 400) return chalk.yellow(status);
  if (status >= 300) return chalk.cyan(status);
  if (status >= 200) return chalk.green(status);
  return status;
});

const formatIp = (ip) => {
  if (ip === '::1') return '127.0.0.1';                   
  if (ip.startsWith('::ffff:')) return ip.split('::ffff:')[1]; // formatting for ipv4
  return ip;
};


const customMorganFormat = (tokens, req, res) => {
  const ip = formatIp(req.ip);
  return [
    chalk.green(`[${new Date().toISOString()}]`),
    chalk.blue(tokens.method(req, res)),
    chalk.magenta(tokens.url(req, res)),
    tokens.statusColor(req, res),
    chalk.cyan.bold(`${tokens['response-time'](req, res)} ms`),
    chalk.red(`- ${ip}`),
  ].join(' ');
};

export default morgan(customMorganFormat);
