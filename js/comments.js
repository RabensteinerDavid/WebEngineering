function initCommentToggle() {

    // Show/hide comments toggle
    const showHideBtn = document.querySelector('.show-hide');
    const commentWrapper = document.querySelector('.comment-wrapper');

    commentWrapper.style.display = 'none';

    showHideBtn.addEventListener('click', function () {
        const isHidden = commentWrapper.style.display === 'none';

        commentWrapper.style.display = isHidden ? 'block' : 'none';
        showHideBtn.textContent = isHidden ? 'Hide comments' : 'Show comments';
    });
}

function createComment(name, comment) {
    const listItem = document.createElement('li');
    const namePara = document.createElement('p');
    const commentPara = document.createElement('p');

    namePara.textContent = name;
    commentPara.textContent = comment;

    listItem.append(namePara, commentPara);

    return listItem;
}

function initCommentForm() {

    // Comment form stuff
    const form = document.querySelector('.comment-form');
    const nameField = document.querySelector('#name');
    const commentField = document.querySelector('#comment');
    const list = document.querySelector('.comment-container');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const nameValue = nameField.value.trim();
        const commentValue = commentField.value.trim();

        if (!nameValue || !commentValue) {
            return;
        }

        list.appendChild(createComment(nameValue, commentValue));

        nameField.value = '';
        commentField.value = '';
    });
}

export default function initComments() {
    initCommentToggle();
    initCommentForm();
}