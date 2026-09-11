var baseUrl = "https://en.wikipedia.org/w/api.php";
var title = "List_of_ursids";

var params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
};

export function fetchBearData() {
    var url = baseUrl + "?" + new URLSearchParams(params).toString();

    return fetch(url)
        .then(function (res) {
            return res.json();
        });
}

export function fetchImageUrl(fileName) {
    var imageParams = {
        action: "query",
        titles: "File:" + fileName,
        prop: "imageinfo",
        iiprop: "url",
        format: "json",
        origin: "*"
    };

    var url = baseUrl + "?" + new URLSearchParams(imageParams).toString();
    return fetch(url).then(function (res) {
        return res.json();
    }).then(function (data) {
        var pages = data.query.pages;
        var page = Object.values(pages)[0];

        return page.imageinfo[0].url;
    });
}