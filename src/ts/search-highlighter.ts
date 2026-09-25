export default function initSearchHighlighter(): void {
  const form = document.querySelector<HTMLFormElement>('.search');
  const article = document.querySelector<HTMLElement>('article');

  if (form === null || article === null) {
    return;
  }

  const searchInput = form.querySelector<HTMLInputElement>('input[name="q"]');

  if (searchInput === null) {
    return;
  }

  form.addEventListener('submit', (event: SubmitEvent) => {
    event.preventDefault();

    removeHighlights(article);

    const searchKey = searchInput.value.trim();
    if (searchKey === '') {
      return;
    }

    highlightMatches(article, createRegex(searchKey));
  });
}

function removeHighlights(article: HTMLElement): void {
  article.querySelectorAll('.highlight').forEach((element) => {
    const { parentNode: parent, textContent } = element;

    if (parent === null) {
      return;
    }

    parent.replaceChild(document.createTextNode(textContent), element);

    parent.normalize();
  });
}

function createRegex(searchKey: string): RegExp {
  const escapedSearchKey = searchKey.replace(/[\[\]\\]/gv, '\\$&');

  return new RegExp(`(${escapedSearchKey})`, 'giv');
}

function highlightMatches(node: Node, regex: RegExp): void {
  if (node instanceof Text) {
    highlightTextNode(node, regex);
    return;
  }

  if (
    !(node instanceof Element) ||
    node.tagName === 'SCRIPT' ||
    node.tagName === 'STYLE'
  ) {
    return;
  }

  Array.from(node.childNodes).forEach((child) => {
    highlightMatches(child, regex);
  });
}

function highlightTextNode(node: Text, regex: RegExp): void {
  const parts = node.data.split(regex);
  const singlePartCount = 1;

  if (parts.length === singlePartCount) {
    return;
  }

  const fragment = document.createDocumentFragment();

  parts.forEach((part, index) => {
    const divisor = 2;
    const matchRemainder = 1;

    if (index % divisor === matchRemainder) {
      const mark = document.createElement('mark');

      mark.classList.add('highlight');
      mark.textContent = part;

      fragment.appendChild(mark);
    } else {
      fragment.appendChild(document.createTextNode(part));
    }
  });

  node.replaceWith(fragment);
}
