const baseUrl = "https://en.wikipedia.org/w/api.php";
const title = "List_of_ursids";

const params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: "3",
    format: "json",
    origin: "*"
};

export function fetchBearData() {
    const url = baseUrl + "?" + new URLSearchParams(params).toString();

    return fetch(url).then(function (response) {
        if (!response.ok) {
            throw new Error('Could not fetch bear data');
        }

        return response.json();
    });
}

export function fetchImageUrl(fileName) {
    const imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    const url = baseUrl + "?" + new URLSearchParams(imageParams).toString();

    return fetch(url)
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Could not fetch image data');
            }

            return response.json();
        })
        .then(function (data) {
            const pages = data.query.pages;
            const page = Object.values(pages)[0];

            if (!page.imageinfo) {
                throw new Error('No image URL available');
            }

            return page.imageinfo[0].url;
        });
}