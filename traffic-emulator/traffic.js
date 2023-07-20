import { config } from './config.js';
import { isLowTrafficPeriod } from './utils.js';

export async function countDelayBetweenRequests(requestTime) {
  const { browsersPoolSize, expectedRunDuration } = config;
  const minRequestsCount = getMinRequestsCount();

  const expectedRunDurationInSeconds = expectedRunDuration / 1000;

  const requestsPerSecond = minRequestsCount / expectedRunDurationInSeconds;

  const requestsPerSecondPerBrowser = requestsPerSecond / browsersPoolSize;

  const maxDelayBetweenRequests =
    1000 / requestsPerSecondPerBrowser - requestTime;
  const minDelayBetweenRequests = maxDelayBetweenRequests / 2;

  return {
    maxDelayBetweenRequests,
    minDelayBetweenRequests,
  };
}

export function getMinRequestsCount() {
  return isLowTrafficPeriod()
    ? config.minRequestsCount / 4
    : config.minRequestsCount;
}
