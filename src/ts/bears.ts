import {fetchBearData, fetchImageUrl} from './api/bears-api';

import type { Bear, BearWithImage } from './models/bear';

const PLACEHOLDER_IMAGE = './media/placeholder.png';

export default async function initBears(): Promise<void> {
    try {
        const data = await fetchBearData();
        const bears = extractBears(data.parse.wikitext['*']);
        const bearsWithImages = await loadBearImages(bears);

        renderBears(bearsWithImages);
    } catch (error) {
        console.error(error);
        showBearError();
    }
}

function extractBears(wikitext: string): Bear[] {
    const rows = wikitext.split('{{Species table/row').slice(1);
    const bears: Bear[] = [];

    rows.forEach((row) => {
        const nameMatch = row.match(/\|name=\[\[(.*?)]/);
        const binomialMatch = row.match(/\|binomial=(.*?)\n/);
        const imageMatch = row.match(/\|image=File:([^|\n]+)/);
        const rangeMatch = row.match(/\|range=(.*?)\s*\|range-image=/);

        const name = nameMatch?.[1];
        const binomial = binomialMatch?.[1];
        const range = rangeMatch?.[1];

        if (name && binomial && range) {
            bears.push({
                name,
                binomial: binomial.trim(),
                fileName: imageMatch?.[1]?.trim() ?? null,
                range: range.trim()
            });
        }
    });

    if (bears.length === 0) {
        throw new Error('No valid bear data found');
    }

    return bears;
}

async function loadBearImages(bears: Bear[]): Promise<BearWithImage[]> {
    return Promise.all(bears.map(loadBearImage));
}

async function loadBearImage(bear: Bear): Promise<BearWithImage> {
    if (!bear.fileName) {
        console.warn('No image filename found for ' + bear.name);
        return {...bear, image: PLACEHOLDER_IMAGE};
    }

    try {
        const image = await fetchImageUrl(bear.fileName);
        return {...bear, image};
    } catch (error) {
        console.error('Could not load image for ' + bear.name, error);
        return {...bear, image: PLACEHOLDER_IMAGE};
    }
}

function renderBears(bears: BearWithImage[]): void {
    const bearList = document.querySelector<HTMLElement>('.bear-list');

    if (!bearList) {
        throw new Error('Bear list element not found');
    }

    const fragment = document.createDocumentFragment();

    bears.forEach((bear) => {
        fragment.appendChild(createBearElement(bear));
    });

    bearList.replaceChildren(fragment);
}

function createBearElement(bear: BearWithImage): HTMLDivElement {
    const bearDiv = document.createElement('div');
    bearDiv.classList.add('bear');

    const image = document.createElement('img');
    image.src = bear.image;
    image.alt = 'Image of ' + bear.name;

    image.addEventListener('error', () => {
        image.src = PLACEHOLDER_IMAGE;
        image.alt = 'Image unavailable for ' + bear.name;
    }, {once: true});

    const description = document.createElement('p');
    const name = document.createElement('b');

    name.textContent = bear.name;
    description.append(name, ' (' + bear.binomial + ')');

    const range = document.createElement('p');
    range.textContent = 'Range: ' + bear.range;

    bearDiv.append(image, description, range);

    return bearDiv;
}

function showBearError(): void {
    const bearList = document.querySelector<HTMLElement>('.bear-list');

    if (!bearList) {
        return;
    }

    const errorMessage = document.createElement('p');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = 'Bear data could not be displayed. Please try again later.';

    bearList.replaceChildren(errorMessage);
}