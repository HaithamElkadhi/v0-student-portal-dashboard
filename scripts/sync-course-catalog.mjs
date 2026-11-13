import { randomUUID } from 'node:crypto';
import { rename, rm, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';

const endpoint = new URL('https://api.airtable.com/v0/appkqvTuc8F0AhWPp/tblApzSxXnKiRxdeZ');
endpoint.searchParams.set('view', 'viw0cMe0ji48XdNgm');
endpoint.searchParams.set('pageSize', '100');

// Keep this order aligned with course() in public/course-finder/app.js.
const fields = [
  'Course name (IT)', 'Course name (EN)', 'University', 'Campus', 'Degree type',
  'Language', 'Academic year', null, 'Admission method', 'Teaching method',
  'Delivery method', 'Class code', 'Class description', 'Class level', 'CUN area',
  'Joint universities', 'Last updated', 'URL', 'Duration (years)', 'Credits (CFU)',
  'Application Fee', 'Application Deadline', 'Application Status', 'Admission requirements',
];
// Keep the retired Admission type slot so existing catalog columns retain their positions.
for (const field of fields) {
  if (field) endpoint.searchParams.append('fields[]', field);
}

async function sync() {
  const token = process.env.AIRTABLE_API_KEY?.trim();
  if (!token) throw new Error('Set AIRTABLE_API_KEY to an Airtable token with data.records:read access.');

  const rows = [];
  const ids = new Set();
  let offset;
  do {
    if (offset) {
      endpoint.searchParams.set('offset', offset);
      await delay(250);
    }
    let response = await fetch(endpoint, {
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (response.status === 429) {
      await response.body?.cancel();
      await delay(30_000);
      response = await fetch(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(20_000),
      });
    }
    if (!response.ok) throw new Error(`Airtable returned HTTP ${response.status}.`);

    const data = await response.json();
    for (const record of data.records) {
      if (ids.has(record.id)) throw new Error(`Airtable returned duplicate record ${record.id}. Retry the sync.`);
      ids.add(record.id);
      rows.push([record.id, ...fields.map(field => {
        const value = field ? record.fields[field] : null;
        return typeof value === 'string' ? value.trim() || null : value ?? null;
      })]);
    }
    offset = data.offset;
  } while (offset);

  rows.sort((a, b) => a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0);
  const catalog = new URL('../public/course-finder/catalog.json', import.meta.url);
  const temporary = new URL(`../catalog.${randomUUID()}.tmp`, import.meta.url);
  try {
    await writeFile(temporary, JSON.stringify(rows));
    await rename(temporary, catalog);
  } finally {
    await rm(temporary, { force: true });
  }
  console.log(`Synced ${rows.length} courses from Airtable.`);
}

sync().catch(error => {
  console.error(`Catalog sync failed: ${error.message}`);
  process.exitCode = 1;
});
