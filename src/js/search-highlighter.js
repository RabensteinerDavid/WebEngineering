export default function initSearchHighlighter() {
    const form = document.querySelector('.search');
    const searchInput = form.querySelector('input[name="q"]');
    const article = document.querySelector('article');

    form.addEventListener('submit', (event) => {
        event.preventDefault();

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
        highlightTextNode(node, regex);
        return;
    }

    if (
        node.nodeType !== Node.ELEMENT_NODE ||
        node.tagName === 'SCRIPT' ||
        node.tagName === 'STYLE'
    ) {
        return;
    }

    Array.from(node.childNodes).forEach((child) => {
        highlightMatches(child, regex);
    });
}

function highlightTextNode(node, regex) {
    const parts = node.nodeValue.split(regex);

    if (parts.length === 1) {
        return;
    }

    const fragment = document.createDocumentFragment();

    parts.forEach((part, index) => {
        if (!part) {
            return;
        }

        if (index % 2 === 1) {
            const mark = document.createElement('mark');

            mark.classList.add('highlight');
            mark.textContent = part;

            fragment.appendChild(mark);
        } else {
            fragment.appendChild(
                document.createTextNode(part)
            );
        }
    });

    node.replaceWith(fragment);
}