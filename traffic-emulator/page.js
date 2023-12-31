import { wait, withTimeout } from './utils.js';
import { config } from './config.js';

/**
 * @param {import('playwright').Page} page
 * */
export async function doRequest(page) {
  await page.goto(config.websiteUrl, {
    waitUntil: 'networkidle',
  });

  await waitForVerification(page);
}

/**
 * @param {import('playwright').Page} page
 * */
export async function doRequestWithPerformanceMark(page) {
  const id = Math.random().toString(36).slice(2);

  performance.mark(`request-start-${id}`);

  await doRequest(page);

  performance.mark(`request-end-${id}`);

  const measure = performance.measure(
    `request-measure-${id}`,
    `request-start-${id}`,
    `request-end-${id}`
  );

  return {
    duration: measure.duration,
  };
}

/**
 * @param {import('playwright').Page} page
 * */
async function waitForVerification(page) {
  await withTimeout(async () => {
    while (true) {
      if (await validatePreJson(page)) {
        return;
      }

      await wait(1000);
    }
  }, 10_000);
}

async function validateMainElement(page) {
  const main = await page.waitForSelector('main');

  const isSuccess = await main
    .getAttribute('data-success')
    .then((attr) => attr === 'true');

  if (isSuccess) {
    const visitorId = await main.getAttribute('data-visitorid');

    if (!visitorId) {
      throw new Error('Visitor id is not defined');
    }

    return true;
  }

  return false;
}

/**
 * @param {import('playwright').Page} page
 *
 * @returns {Promise<boolean>}
 * */
async function validatePreJson(page) {
  const pre = await page.waitForSelector('pre');

  const text = await pre.textContent();

  try {
    const json = JSON.parse(text);

    return Boolean(json.requestId);
  } catch {
    return false;
  }
}
