import {fetchBearData, fetchImageUrl} from './api/bears-api.js';

const PLACEHOLDER_IMAGE = './media/placeholder.png';

export default function initBears() {
    fetchBearData()
        .then(function (data) {
            const bears = extractBears(data.parse['wikitext']['*']);
            loadBearImages(bears);
        })
        .catch(function (error) {
            console.error(error);
            showBearError();
        });
}

function extractBears(wikitext) {

    if (!wikitext) {
        throw new Error('No valid bear data found');
    }

    const rows = wikitext.split('{{Species table/row').slice(1);
    const bears = [];

    rows.forEach(function (row) {
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

function loadBearImages(bears) {
    let loadedImages = 0;

    function imageFinished() {
        loadedImages++;

        if (loadedImages === bears.length) {
            renderBears(bears);
        }
    }

    bears.forEach(function (bear) {
        if (!bear.fileName) {
            console.warn('No image filename found for ' + bear.name);

            bear.image = PLACEHOLDER_IMAGE;
            imageFinished();
            return;
        }

        fetchImageUrl(bear.fileName)
            .then(function (imageUrl) {
                bear.image = imageUrl;
                imageFinished();
            })
            .catch(function (error) {
                console.error('Could not load image for ' + bear.name, error);

                bear.image = PLACEHOLDER_IMAGE;
                imageFinished();
            });
    });
}

function renderBears(bears) {
    const moreBears = document.querySelector('.more_bears');

    bears.forEach(function (bear) {
        const bearDiv = document.createElement('div');
        bearDiv.classList.add('bear');

        const image = document.createElement('img');
        image.src = bear.image;
        image.alt = 'Image of ' + bear.name;
        image.style.width = '200px';
        image.style.height = 'auto';

        image.addEventListener('error', function () {
            if (image.src !== PLACEHOLDER_IMAGE) {
                image.src = PLACEHOLDER_IMAGE;
            }
        });

        bearDiv.appendChild(image);

        bearDiv.innerHTML +=
            '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
            '<p>Range: ' + bear.range + '</p>';

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