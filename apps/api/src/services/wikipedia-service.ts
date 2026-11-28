import { z } from '../config/zod.js';
import { bearSchema, type Bear } from '../models/bears.js';
import { HttpError } from '../errors.js';
import { wikipediaCache } from '../cache/bears-cache.js';
import { env } from '../config/env.js';

const minimumLength = 1;
const badGateway = 502;
const emptyCount = 0;
const placeholder = '/media/placeholder.png';
const timeoutMs = 10_000;
const userAgent =
  'WebEngineeringBears/1.0 (https://github.com/RabensteinerDavid/WebEngineering)';

const wikiSchema = z.object({
  parse: z.object({
    wikitext: z.object({ '*': z.string().min(minimumLength) }),
  }),
});
const imagesSchema = z.object({
  query: z.object({
    pages: z.record(
      z.string(),
      z.object({
        title: z.string(),
        imageinfo: z.array(z.object({ url: z.url() })).optional(),
      })
    ),
    normalized: z
      .array(z.object({ from: z.string(), to: z.string() }))
      .optional(),
  }),
});

async function fetchWikipedia(
  params: Record<string, string>
): Promise<unknown> {
  try {
    const url = new URL(env.WIKIPEDIA_API_URL);
    url.search = new URLSearchParams({ ...params, format: 'json' }).toString();
    const response = await fetch(url, {
      headers: { 'User-Agent': userAgent },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!response.ok)
      throw new Error(`Wikipedia returned HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    throw new HttpError(badGateway, 'Wikipedia request failed.', [], error);
  }
}

function matchValue(row: string, pattern: RegExp): string {
  return pattern.exec(row)?.groups?.value?.trim() ?? '';
}

function extractBear(row: string): { bear: Bear; fileName: string } {
  const name = matchValue(row, /\|\s*name\s*=\s*\[\[(?<value>[^\]\n]+)\]\]/v);
  const binomial = matchValue(row, /\|\s*binomial\s*=\s*(?<value>[^\|\n]+)/v);
  const range = matchValue(
    row,
    /\|\s*range\s*=\s*(?<value>.*?)\s*\|range-image=/sv
  );
  const fileName = matchValue(row, /\|\s*image\s*=\s*File:(?<value>[^\|\n]+)/v);
  const id = binomial
    .toLowerCase()
    .replace(/[^a-z0-9]+/gv, '-')
    .replace(/^-|-$/gv, '');
  const bear = bearSchema.parse({
    id,
    name: name.split('|').pop(),
    binomial,
    range,
    image: placeholder,
  });
  return { bear, fileName };
}

async function loadImageUrls(
  fileNames: string[]
): Promise<Map<string, string>> {
  const images = new Map<string, string>();
  const titles = fileNames
    .filter((fileName) => fileName !== '')
    .map((fileName) => `File:${fileName}`);

  if (titles.length === emptyCount) {
    return images;
  }

  const response = await fetchWikipedia({
    action: 'query',
    titles: titles.join('|'),
    prop: 'imageinfo',
    iiprop: 'url',
  });
  const data = imagesSchema.parse(response);

  for (const page of Object.values(data.query.pages)) {
    const [imageInfo] = page.imageinfo ?? [];
    if (imageInfo !== undefined) {
      images.set(page.title, imageInfo.url);
    }
  }

  // Wikipedia may correct a file name. Keep the original name usable too.
  for (const alias of data.query.normalized ?? []) {
    const imageUrl = images.get(alias.to);
    if (imageUrl !== undefined) {
      images.set(alias.from, imageUrl);
    }
  }

  return images;
}

async function fetchBears(): Promise<Bear[]> {
  const response = await fetchWikipedia({
    action: 'parse',
    page: 'List_of_ursids',
    prop: 'wikitext',
    section: '3',
  });

  const {
    parse: {
      wikitext: { '*': wikitext },
    },
  } = wikiSchema.parse(response);
  const [, ...rows] = wikitext.split('{{Species table/row');
  const entries = rows.map(extractBear);

  if (entries.length === emptyCount) {
    throw new HttpError(badGateway, 'Wikipedia returned no bears.');
  }

  const imageUrls = await loadImageUrls(entries.map((entry) => entry.fileName));

  const bears: Bear[] = [];
  const seenIds = new Set<string>();

  for (const entry of entries) {
    if (seenIds.has(entry.bear.id)) {
      continue;
    }

    const imageUrl = imageUrls.get(`File:${entry.fileName}`) ?? placeholder;
    const bear = bearSchema.parse({ ...entry.bear, image: imageUrl });

    bears.push(bear);
    seenIds.add(bear.id);
  }

  return bears;
}

export async function loadWikipediaBears(): Promise<Bear[]> {
  try {
    return await wikipediaCache.get(env.WIKIPEDIA_API_URL, fetchBears);
  } catch (error) {
    if (error instanceof z.ZodError)
      throw new HttpError(badGateway, 'Invalid Wikipedia response.', [], error);
    throw error;
  }
}
