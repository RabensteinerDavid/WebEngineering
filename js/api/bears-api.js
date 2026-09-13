const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';
const BEAR_PAGE_TITLE = 'List_of_ursids';

const BEAR_DATA_PARAMS = {
    action: 'parse',
    page: BEAR_PAGE_TITLE,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*'
};

async function fetchJson(queryParams, errorMessage) {
    const url = WIKIPEDIA_API_URL + '?' + new URLSearchParams(queryParams).toString();

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(errorMessage);
    }
    return response.json();
}

export function fetchBearData() {
    return fetchJson(BEAR_DATA_PARAMS, 'Could not fetch bear data');
}

export async function fetchImageUrl(fileName) {
    const imageParams = {
        action: 'query',
        titles: 'File:' + fileName,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
        origin: '*'
    };

    const data = await fetchJson(imageParams, 'Could not fetch image data');

    const pages = data.query?.pages;
    const page = pages ? Object.values(pages)[0] : null;
    const imageUrl = page?.imageinfo?.[0]?.url;

    if (!imageUrl) {
        throw new Error('No image URL available');
    }

    return imageUrl;
}