import { chromium } from 'playwright';
import { doRequest, doRequestWithPerformanceMark } from './page.js';
import { isLowTrafficPeriod, waitBetween } from './utils.js';
import { config } from './config.js';
import ora from 'ora';
import { countDelayBetweenRequests, getMinRequestsCount } from './traffic.js';

let requestsCount = 0;

async function getBrowsers() {
  return await Promise.all(
    Array.from({ length: config.browsersPoolSize }).map(() =>
      chromium.launch({
        headless: true,
      })
    )
  );
}

async function getAverageRequestTime(probCount = 10) {
  const durations = [];

  for (let i = 0; i < probCount; i++) {
    const browser = await chromium.launch({
      headless: true,
    });

    try {
      const page = await browser.newPage();

      const duration = await doRequestWithPerformanceMark(page).then(
        (r) => r.duration
      );

      durations.push(duration);
    } finally {
      performance.clearMarks();
      await browser.close();
    }
  }

  return durations.reduce((a, b) => a + b, 0) / durations.length;
}

async function main() {
  console.info('Calculating average request time');

  const requestTime = await getAverageRequestTime();

  console.info(`Average request time: ${requestTime}`);

  if (typeof requestTime !== 'number') {
    throw new TypeError('Request time is not a number');
  }

  const { maxDelayBetweenRequests, minDelayBetweenRequests } =
    await countDelayBetweenRequests(requestTime);

  console.info(`Min delay between requests: ${minDelayBetweenRequests}`);
  console.info(`Max delay between requests: ${maxDelayBetweenRequests}`);

  if (minDelayBetweenRequests < 0) {
    throw new Error('Min delay between requests is less than 0');
  }

  if (isLowTrafficPeriod()) {
    console.info('Low traffic period, less requests will be made than usual');
  }

  const browsers = await getBrowsers();

  console.info(`Browsers count: ${browsers.length}`);

  const spinner = ora('Starting requests').start();

  const minRequestsCount = getMinRequestsCount();

  const expectedDurationSeconds = config.expectedRunDuration / 1000;
  const start = performance.mark('main-start');
  const measureDuration = () => performance.measure('main-end', start).duration;

  let duration = measureDuration();

  try {
    await Promise.all(
      browsers.map(async (browser) => {
        try {
          while (duration < config.expectedRunDuration) {
            const context = await browser.newContext();
            const page = await context.newPage();

            await waitBetween(minDelayBetweenRequests, maxDelayBetweenRequests);

            try {
              await doRequest(page);
            } finally {
              duration = measureDuration();

              requestsCount++;

              const durationSeconds = duration / 1000;
              spinner.text = `Requests count: ${requestsCount} / ${minRequestsCount}. Duration: ${durationSeconds.toFixed(
                2
              )}s / ${expectedDurationSeconds}s`;

              await context.close();
            }
          }
        } finally {
          await browser.close();
        }
      })
    );

    spinner.succeed();
  } catch (e) {
    spinner.fail(e);

    throw e;
  } finally {
    const end = performance.measure('main-end', start);

    console.info(`Total duration: ${end.duration}`);
  }
}

main()
  .then(() => {
    console.info('Done');

    process.exit(0);
  })
  .catch((error) => {
    console.error(error);

    process.exit(1);
  });
