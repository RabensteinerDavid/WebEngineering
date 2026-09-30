import { fetchBearData, fetchImageUrl } from './api/bears-api';

import type { Bear, BearWithImage } from './models/bear';

export const PLACEHOLDER_IMAGE = '/media/placeholder.png';
const FIRST_ITEM_INDEX = 0;

export async function loadBears(): Promise<BearWithImage[]> {
  const data = await fetchBearData();
  const bears = extractBears(data.parse.wikitext['*']);
  return await Promise.all(bears.map(loadBearImage));
}

function extractBears(wikitext: string): Bear[] {
  const [, ...rows] = wikitext.split('{{Species table/row');
  const bears = rows
    .map(extractBearFromRow)
    .filter((bear): bear is Bear => bear !== null);

  if (bears.length === FIRST_ITEM_INDEX) {
    throw new Error('No valid bear data found');
  }

  return bears;
}

function extractBearFromRow(row: string): Bear | null {
  const name = matchGroup(row, /\|name=\[\[(?<name>.*?)/v);
  const binomial = matchGroup(row, /\|binomial=(?<binomial>.*?)\n/v);
  const fileName = matchGroup(row, /\|image=File:(?<fileName>[^\n]+)/v);
  const range = matchGroup(row, /\|range=(?<range>.*?)\s*\|range-image=/v);

  if (name === undefined || binomial === undefined || range === undefined) {
    return null;
  }

  return {
    name,
    binomial: binomial.trim(),
    fileName: fileName === undefined ? null : fileName.trim(),
    range: range.trim(),
  };
}

function matchGroup(row: string, regex: RegExp): string | undefined {
  const groups = regex.exec(row)?.groups;
  return groups === undefined
    ? undefined
    : Object.values(groups)[FIRST_ITEM_INDEX];
}

async function loadBearImage(bear: Bear): Promise<BearWithImage> {
  const { fileName } = bear;

  if (fileName === null || fileName === '') {
    return { ...bear, image: PLACEHOLDER_IMAGE };
  }

  try {
    const image = await fetchImageUrl(fileName);
    return { ...bear, image };
  } catch (error) {
    return { ...bear, image: PLACEHOLDER_IMAGE };
  }
}
