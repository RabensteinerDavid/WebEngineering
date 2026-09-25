import {fetchBearData, fetchImageUrl} from './api/bears-api.js';

const PLACEHOLDER_IMAGE = './media/placeholder.png';

export default async function initBears() {
    try {
        const data = await fetchBearData();
        const bears = extractBears(data.parse?.wikitext?.['*']);
        const bearsWithImages = await loadBearImages(bears);

        renderBears(bearsWithImages);
    } catch (error) {
        console.error(error);
        showBearError();
    }
}

function extractBears(wikitext) {

    if (!wikitext) {
        throw new Error('No valid bear data found');
    }

    const rows = wikitext.split('{{Species table/row').slice(1);
    const bears = [];

    rows.forEach((row) => {
        const nameMatch = row.match(/\|name=\[\[(.*?)]/);
        const binomialMatch = row.match(/\|binomial=(.*?)\n/);
        const imageMatch = row.match(/\|image=File:([^|\n]+)/);
        const rangeMatch = row.match(/\|range=(.*?)\s*\|range-image=/);

        if (nameMatch && binomialMatch && rangeMatch) {
            bears.push({
                name: nameMatch[1],
                binomial: binomialMatch[1].trim(),
                fileName: imageMatch ? imageMatch[1].trim() : null,
                range: rangeMatch[1].trim()
            });
        }
    });

    if (bears.length === 0) {
        throw new Error('No valid bear data found');
    }

    return bears;
}

async function loadBearImages(bears) {
    return Promise.all(bears.map(loadBearImage));
}

async function loadBearImage(bear) {
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

function renderBears(bears) {
    const bearList = document.querySelector('.bear-list');
    const fragment = document.createDocumentFragment();

    bears.forEach((bear) => {
        fragment.appendChild(createBearElement(bear));
    });

    bearList.replaceChildren(fragment);
}

function createBearElement(bear) {
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

function showBearError() {
    const bearList = document.querySelector('.bear-list');
    const errorMessage = document.createElement('p');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = 'Bear data could not be displayed. Please try again later.';

    bearList.replaceChildren(errorMessage);
}