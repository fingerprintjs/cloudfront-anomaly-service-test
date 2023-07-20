export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function waitBetween(min, max) {
  return wait(min + Math.random() * (max - min));
}

export function withTimeout(callback, ms) {
  return Promise.race([
    callback(),
    wait(ms).then(() => {
      throw new Error(`Timeout of ${ms}ms exceeded`);
    }),
  ]);
}

// Low traffic period = night (from 22:00 to 6:00)
export function isLowTrafficPeriod() {
  const now = new Date();

  const hour = now.getHours();

  return hour >= 22 || hour <= 6;
}
