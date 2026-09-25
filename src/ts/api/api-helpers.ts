import type {BearDataResponse, ImageDataResponse} from './api-types';

const WIKIPEDIA_API_URL = 'https://en.wikipedia.org/w/api.php';

export async function fetchJson(queryParams: Record<string, string>, errorMessage: string): Promise<unknown> {
    const url = WIKIPEDIA_API_URL + '?' + new URLSearchParams(queryParams).toString();
    const response = await fetch(url);

    if (!response.ok) {
        throw new Error(errorMessage);
    }

    return await response.json();
}

function isObject(value: unknown): value is Record<string, unknown> {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value)
    );
}

export function isBearDataResponse(data: unknown): data is BearDataResponse {
    if (!isObject(data)) return false;

    const parse = data.parse;

    if (!isObject(parse)) return false;

    const wikitext = parse.wikitext;

    if (!isObject(wikitext)) return false;

    return typeof wikitext['*'] === 'string';
}

export function isImageDataResponse(data: unknown): data is ImageDataResponse {
    if (!isObject(data)) return false;

    const query = data.query;

    if (!isObject(query)) return false;

    const pages = query.pages;

    if (!isObject(pages)) return false;

    return Object.values(pages).every((page) => {
        if (!isObject(page)) return false;

        if (!('imageinfo' in page)) return true;

        const imageInfo = page.imageinfo;

        if (!Array.isArray(imageInfo)) return false;

        return imageInfo.every((info) => {
            return (
                isObject(info) &&
                typeof info.url === 'string'
            );
        });
    });
}