import {fetchBearData, fetchImageUrl} from './api/bears-api.js';

export default function initBears() {
    fetchBearData().then(function (data) {
        const bears = extractBears(data.parse['wikitext']['*']);
        loadBearImages(bears);
    });
}

function extractBears(wikitext) {

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
    return bears;
}

function loadBearImages(bears) {
    let loadedImages = 0;

    bears.forEach(function (bear) {

        if (bear.fileName) {
            fetchImageUrl(bear.fileName).then(function (imageUrl) {
                bear.image = imageUrl;
                loadedImages++;

                if (loadedImages === bears.length) {
                    renderBears(bears);
                }
            });
        } else {
            loadedImages++;

            if (loadedImages === bears.length) {
                renderBears(bears);
            }
        }
    });
}

function renderBears(bears) {

    const moreBears = document.querySelector('.more_bears');

    bears.forEach(function (bear) {
        const html = '<div class="bear">' +
            '<img src="' + bear.image + '" alt="Image of ' + bear.name + '" style="width:200px; height:auto;">' +
            '<p><b>' + bear.name + '</b> (' + bear.binomial + ')</p>' +
            '<p>Range: ' + bear.range + '</p>' +
            '</div>';
        moreBears.innerHTML += html;
    });
}