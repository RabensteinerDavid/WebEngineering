export default function initSearchHighlighter() {
    const form = document.querySelector('.search');
    const searchInput = document.querySelector('.search input[name="q"]');
    const article = document.querySelector('article');

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        removeHighlights(article);

        const searchKey = searchInput.value.trim();
        if (!searchKey) return;

        highlightMatches(article, createRegex(searchKey));
    })
}

function removeHighlights(article) {
    article.querySelectorAll('.highlight').forEach((element) => {
        const parent = element.parentNode;
        parent.replaceChild(document.createTextNode(element.textContent), element);
        parent.normalize();
    });
}

function createRegex(searchKey) {
    return new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
}

function highlightMatches(node, regex) {
    if (node.nodeType === Node.TEXT_NODE) {
        const match = node.nodeValue.match(regex);

        if (match) {
            const span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
            node.replaceWith.apply(node, span.childNodes);
        }
    } else if (
        node.nodeType === Node.ELEMENT_NODE &&
        node.tagName !== 'SCRIPT' &&
        node.tagName !== 'STYLE'
    ) {
        node.childNodes.forEach((child) => {
            highlightMatches(child, regex);
        });
    }
}