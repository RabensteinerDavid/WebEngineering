function initCommentToggle() {

    // Show/hide comments toggle
    var showHideBtn = document.querySelector('.show-hide');
    var commentWrapper = document.querySelector('.comment-wrapper');

    commentWrapper.style.display = 'none';

    showHideBtn.onclick = function () {
        var showHideText = showHideBtn.textContent;
        if (showHideText === 'Show comment') {
            showHideBtn.textContent = 'Hide comments';
            commentWrapper.style.display = 'block';
        } else {
            showHideBtn.textContent = 'Show comments';
            commentWrapper.style.display = 'none';
        }
    };
}

function createComment(name, comment) {
    var listItem = document.createElement('li');
    var namePara = document.createElement('p');
    var commentPara = document.createElement('p');

    namePara.textContent = name;
    commentPara.textContent = comment;

    listItem.append(namePara, commentPara);

    return listItem;
}

function initCommentForm() {

    // Comment form stuff
    var form = document.querySelector('.comment-form');
    var nameField = document.querySelector('#name');
    var commentField = document.querySelector('#comment');
    var list = document.querySelector('.comment-container');

    form.onsubmit = function (e) {
        e.preventDefault();

        var nameValue = nameField.value;
        var commentValue = commentField.value;

        list.appendChild(createComment(nameValue, commentValue));

        nameField.value = '';
        commentField.value = '';
    }
}

export default function initComments() {
    initCommentToggle();
    initCommentForm();
}