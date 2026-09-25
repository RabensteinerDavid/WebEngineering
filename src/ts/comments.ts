function initCommentToggle(commentsSection: HTMLElement): void {

    // Show/hide comments toggle
    const toggleButton = commentsSection.querySelector<HTMLButtonElement>('.show-hide');
    const commentWrapper = commentsSection.querySelector<HTMLElement>('.comment-wrapper');

    if (!toggleButton || !commentWrapper) {
        return;
    }

    toggleButton.addEventListener('click', () => {
        commentWrapper.hidden = !commentWrapper.hidden;

        const isVisible = !commentWrapper.hidden;

        toggleButton.textContent = isVisible ? 'Hide comments' : 'Show comments';

        toggleButton.setAttribute('aria-expanded', String(isVisible));
    });
}

function createComment(name: string, comment: string): HTMLLIElement {
    const listItem = document.createElement('li');
    const nameParagraph = document.createElement('p');
    const commentParagraph = document.createElement('p');

    nameParagraph.textContent = name;
    commentParagraph.textContent = comment;

    listItem.append(nameParagraph, commentParagraph);

    return listItem;
}

function initCommentForm(commentsSection: HTMLElement): void {

    // Comment form stuff
    const form = commentsSection.querySelector<HTMLFormElement>('.comment-form');
    const nameField = commentsSection.querySelector<HTMLInputElement>('#name');
    const commentField = commentsSection.querySelector<HTMLTextAreaElement>('#comment');
    const list = commentsSection.querySelector<HTMLElement>('.comment-container');

    if (!form || !nameField || !commentField || !list) {
        return;
    }

    form.addEventListener('submit', (event: SubmitEvent) => {
        event.preventDefault();

        const name = nameField.value.trim();
        const comment = commentField.value.trim();

        if (!name || !comment) {
            return;
        }

        list.appendChild(createComment(name, comment));

        form.reset();
    });
}

export default function initComments(): void {
    const commentsSection = document.querySelector<HTMLElement>('.comments');

    if (!commentsSection) {
        return;
    }

    initCommentToggle(commentsSection);
    initCommentForm(commentsSection);
}