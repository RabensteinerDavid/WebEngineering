import { fetchBearData, fetchImageUrl } from './api/bears-api';

import type { Bear, BearWithImage } from './models/bear';

const PLACEHOLDER_IMAGE = './media/placeholder.png';
const EMPTY_ARRAY_LENGTH = 0;

export default async function initBears(): Promise<void> {
  try {
    const data = await fetchBearData();
    const bears = extractBears(data.parse.wikitext['*']);
    const bearsWithImages = await loadBearImages(bears);

    renderBears(bearsWithImages);
  } catch (error) {
    reportCaughtError(error);
    showBearError();
  }
}

function extractBears(wikitext: string): Bear[] {
  const [, ...rows] = wikitext.split('{{Species table/row');
  const bears = rows
    .map(extractBearFromRow)
    .filter((bear): bear is Bear => bear !== null);

  if (bears.length === EMPTY_ARRAY_LENGTH) {
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
    : Object.values(groups)[EMPTY_ARRAY_LENGTH];
}

async function loadBearImages(bears: Bear[]): Promise<BearWithImage[]> {
  return await Promise.all(bears.map(loadBearImage));
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
    reportCaughtError(error);
    return { ...bear, image: PLACEHOLDER_IMAGE };
  }
}

function renderBears(bears: BearWithImage[]): void {
  const bearList = document.querySelector<HTMLElement>('.bear-list');

  if (bearList === null) {
    throw new Error('Bear list element not found');
  }

  const fragment = document.createDocumentFragment();

  bears.forEach((bear) => {
    fragment.appendChild(createBearElement(bear));
  });

  bearList.replaceChildren(fragment);
}

function createBearElement(bear: BearWithImage): HTMLDivElement {
  const { image: imageUrl, name: bearName, binomial, range: bearRange } = bear;

  const bearDiv = document.createElement('div');
  bearDiv.classList.add('bear');

  const image = document.createElement('img');
  image.src = imageUrl;
  image.alt = `Image of ${bearName}`;

  image.addEventListener(
    'error',
    () => {
      image.src = PLACEHOLDER_IMAGE;
      image.alt = `Image unavailable for ${bearName}`;
    },
    { once: true }
  );

  const description = document.createElement('p');
  const name = document.createElement('b');

  name.textContent = bearName;
  description.append(name, ` (${binomial})`);

  const range = document.createElement('p');
  range.textContent = `Range: ${bearRange}`;

  bearDiv.append(image, description, range);

  return bearDiv;
}

function showBearError(): void {
  const bearList = document.querySelector<HTMLElement>('.bear-list');

  if (bearList === null) {
    return;
  }

  const errorMessage = document.createElement('p');
  errorMessage.classList.add('error-message');
  errorMessage.textContent =
    'Bear data could not be displayed. Please try again later.';

  bearList.replaceChildren(errorMessage);
}

function reportCaughtError(error: unknown): void {
  if (error instanceof Error) {
    reportError(error);
    return;
  }

  reportError(new Error(String(error)));
}
