const explicitTarget = process.env.SMOKE_URL;
const domainTarget = process.env.APP_DOMAIN
  ? `https://${process.env.APP_DOMAIN}/api/v1/health`
  : undefined;
const target = explicitTarget ?? domainTarget ?? 'http://localhost/api/v1/health';

const response = await fetch(target, {
  headers: { Accept: 'application/json' },
  signal: AbortSignal.timeout(10_000),
});
if (!response.ok) {
  throw new Error(`Smoke request failed (${response.status}) for ${target}`);
}

const payload = (await response.json()) as { status?: unknown };
if (payload.status !== 'ok') {
  throw new Error(`Smoke response for ${target} did not contain status=ok`);
}
console.log(`Smoke OK: ${target}`);
