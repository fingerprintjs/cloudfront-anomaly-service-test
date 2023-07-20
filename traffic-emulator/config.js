import dotenv from 'dotenv';
import path from 'path';

const dirname = import.meta.url.slice(7, import.meta.url.lastIndexOf('/'));

dotenv.config({
  path: path.resolve(dirname, '../.env'),
});

export const config = {
  minRequestsCount: process.env.MIN_REQUESTS_COUNT
    ? parseInt(process.env.MIN_REQUESTS_COUNT)
    : 700,
  expectedRunDuration: process.env.EXPECTED_RUN_DURATION
    ? parseInt(process.env.EXPECTED_RUN_DURATION)
    : 3_600_000,
  browsersPoolSize: process.env.BROWSERS_POOL_SIZE
    ? parseInt(process.env.BROWSERS_POOL_SIZE)
    : 10,
  websiteUrl: process.env.WEBSITE_URL,
};

if (!config.websiteUrl) {
  throw new Error('WEBSITE_URL not set');
}
