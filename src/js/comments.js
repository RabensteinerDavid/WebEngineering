function initCommentToggle(commentsSection) {

    // Show/hide comments toggle
    const toggleButton = commentsSection.querySelector('.show-hide');
    const commentWrapper = commentsSection.querySelector('.comment-wrapper');

    toggleButton.addEventListener('click', () => {
        commentWrapper.hidden = !commentWrapper.hidden;

        const isVisible = !commentWrapper.hidden;

        toggleButton.textContent = isVisible ? 'Hide comments' : 'Show comments';

        toggleButton.setAttribute('aria-expanded', String(isVisible));
    });
}

function createComment(name, comment) {
    const listItem = document.createElement('li');
    const nameParagraph = document.createElement('p');
    const commentParagraph = document.createElement('p');

    nameParagraph.textContent = name;
    commentParagraph.textContent = comment;

    listItem.append(nameParagraph, commentParagraph);

    return listItem;
}

function initCommentForm(commentsSection) {

    // Comment form stuff
    const form = commentsSection.querySelector('.comment-form');
    const nameField = form.querySelector('#name');
    const commentField = form.querySelector('#comment');
    const list = commentsSection.querySelector('.comment-container');

    form.addEventListener('submit', (event) => {
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

export default function initComments() {
    const commentsSection = document.querySelector('.comments');

    initCommentToggle(commentsSection);
    initCommentForm(commentsSection);
}