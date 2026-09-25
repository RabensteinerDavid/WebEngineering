import {fetchJson, isBearDataResponse, isImageDataResponse} from './api-helpers';

import type {BearDataResponse} from './api-types';

const BEAR_PAGE_TITLE = 'List_of_ursids';

const BEAR_DATA_PARAMS: Record<string, string> = {
    action: 'parse',
    page: BEAR_PAGE_TITLE,
    prop: 'wikitext',
    section: '3',
    format: 'json',
    origin: '*'
};

export async function fetchBearData(): Promise<BearDataResponse> {
    const data = await fetchJson(BEAR_DATA_PARAMS, 'Could not fetch bear data');

    if (!isBearDataResponse(data)) {
        throw new Error('Invalid bear data received');
    }

    return data;
}

export async function fetchImageUrl(fileName: string): Promise<string> {
    const imageParams: Record<string, string> = {
        action: 'query',
        titles: 'File:' + fileName,
        prop: 'imageinfo',
        iiprop: 'url',
        format: 'json',
        origin: '*'
    };

    const data = await fetchJson(imageParams, 'Could not fetch image data');

    if (!isImageDataResponse(data)) {
        throw new Error('Invalid image data received');
    }

    const page = Object.values(data.query.pages)[0];
    const imageUrl = page?.imageinfo?.[0]?.url;

    if (!imageUrl) {
        throw new Error('No image URL available');
    }

    return imageUrl;
}