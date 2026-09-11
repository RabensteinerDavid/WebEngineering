export default function initSearchHighlighter() {
    document.querySelector('.search').addEventListener('submit', function (e) {
        e.preventDefault();

        removeHighlights();

        var searchKey = this.q.value.trim();
        if (!searchKey) return;

        walk(document.body, createRegex(searchKey));
    })
}

function removeHighlights() {
    document.querySelectorAll('.highlight').forEach(function (el) {
        var parent = el.parentNode;
        parent.replaceChild(document.createTextNode(el.textContent), el);
        parent.normalize();
    });
}

function createRegex(searchKey) {
    return new RegExp('(' + searchKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
}

function walk(node, regex) {
    if (node.nodeType === 3) { // Text node
        var match = node.nodeValue.match(regex);
        if (match) {
            var span = document.createElement('span');
            span.innerHTML = node.nodeValue.replace(regex, '<mark class="highlight">$1</mark>');
            node.replaceWith.apply(node, span.childNodes);
        }
    } else if (node.nodeType === 1 && node.tagName !== 'SCRIPT' && node.tagName !== 'STYLE' && node.tagName !== 'FORM') {
        node.childNodes.forEach(child => walk(child, regex));
    }
}