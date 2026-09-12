import {fetchBearData, fetchImageUrl} from './api/bears-api.js';

const PLACEHOLDER_IMAGE = './media/placeholder.png';

export default async function initBears() {
    try {
        const data = await fetchBearData();
        const bears = extractBears(data.parse['wikitext']['*']);

        await loadBearImages(bears);
        renderBears(bears);
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
            const bear = {
                name: nameMatch[1],
                binomial: binomialMatch[1].trim(),
                fileName: imageMatch ? imageMatch[1].trim() : null,
                range: rangeMatch[1].trim()
            };

            bears.push(bear);
        }
    });

    if (bears.length === 0) {
        throw new Error('No valid bear data found');
    }

    return bears;
}

async function loadBearImages(bears) {
    const imagePromises = bears.map(async (bear) => {
        if (!bear.fileName) {
            console.warn('No image filename found for ' + bear.name);
            bear.image = PLACEHOLDER_IMAGE;
            return;
        }

        try {
            bear.image = await fetchImageUrl(bear.fileName);
        } catch (error) {
            console.error('Could not load image for ' + bear.name, error);
            bear.image = PLACEHOLDER_IMAGE;
        }
    });

    await Promise.all(imagePromises);
}

function renderBears(bears) {
    const moreBears = document.querySelector('.more_bears');

    bears.forEach((bear) => {
        const bearDiv = document.createElement('div');
        bearDiv.classList.add('bear');

        const image = document.createElement('img');
        image.src = bear.image;
        image.alt = 'Image of ' + bear.name;
        image.style.width = '200px';
        image.style.height = 'auto';

        image.addEventListener('error', () => {
            if (image.getAttribute('src') !== PLACEHOLDER_IMAGE) {
                image.src = PLACEHOLDER_IMAGE;
            }
        });

        bearDiv.appendChild(image);

        bearDiv.insertAdjacentHTML(
            'beforeend',
            '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
            '<p>Range: ' + bear.range + '</p>'
        );

        moreBears.appendChild(bearDiv);
    });
}

function showBearError() {
    const moreBears = document.querySelector('.more_bears');

    const errorMessage = document.createElement('p');
    errorMessage.classList.add('error-message');
    errorMessage.textContent = 'Bear data could not be displayed. Please try again later.';

    moreBears.appendChild(errorMessage);
}