// API Endpoint
const api_url = 'https://64fdbdfb596493f7af7e82b1.mockapi.io/tasks';

// Global Variables
const date = new Date();

// Service Worker
// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js', { scope: '/' });
// }

// Dark Mode
if (localStorage.getItem('preferDark') == '1') {
    enableDarkMode()
}

document.getElementById('dark-mode').addEventListener('click', enableDarkMode);

function enableDarkMode() {
    document.body.classList.toggle('dark');
    const darkMode = document.getElementById('dark-mode')
    darkMode.innerHTML === 'Enable Dark Mode' ? darkMode.innerHTML = 'Disable Dark Mode' : darkMode.innerHTML = 'Enable Dark Mode';
}

document.getElementById('dark-mode').addEventListener('click', function () {
    localStorage.getItem('preferDark') == '1' ? localStorage.setItem('preferDark', '0') : localStorage.setItem('preferDark', '1');
});

// Top Bar - Cookie Notice
const topbar = document.getElementById('top-bar-hide');
topbar.addEventListener('click', function () {
    document.querySelector('.top-bar').style.display = 'none';
    setCookie('skuflic-todo-cookie-notice', 'closed', 7)
})

if (getCookie('skuflic-todo-cookie-notice') == 'closed') {
    document.querySelector('.top-bar').style.display = 'none';
}

function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
}

function setCookie(name, value, days) {
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    let expires = 'expires=' + date.toUTCString();
    document.cookie = name + '=' + value + ';' + expires + ';path=/';
}

// Logo Animation
var changes = 0;
progressLogEl = document.querySelector('.percentage');
anime({
    targets: '.loading .el',
    direction: 'alternate',
    loop: false,
    duration: 1500,
    easing: 'easeInOutCirc',
    update: function (anim) {
        progressLogEl.innerHTML = Math.round(anim.progress) + '%';
    },
});

setTimeout(() => {
    document.getElementsByClassName('loading')[0].style.display = 'none';
}, 1500)


// Modal
// References to DOM elements
const modal = document.getElementById('modal');
const button = document.getElementById('button');
const span = document.querySelector('.close-modal');

// Show Modal
function showModal() {
    modal.style.display = 'block';
}

// Hide Modal
function hideModal() {
    modal.style.display = 'none';
}

// Event listener for the button click
button.addEventListener('click', showModal);

// Event listener for the close button click
span.addEventListener('click', hideModal);

// Event listener for clicks outside the modal
window.addEventListener('click', function (event) {
    if (event.target === modal) {
        console.log(event.target); // Object reference
        hideModal();
    }
});


// Footer
document.getElementById('year').innerText = date.getFullYear();

// Greeting & Date
(function () {
    const hour = date.getHours()
    const icon = document.getElementById('icon');
    let text = null;

    if (hour < 12) {
        icon.innerText = 'routine';
        text = 'Good Morning';
    } else if (hour < 18) {
        icon.innerText = 'clear_day';
        text = 'Good Afternoon';
    } else {
        icon.innerText = 'dark_mode';
        text = 'Good Evening';
    }

    document.getElementById('greeting').innerHTML = `${text}`;

    // Date
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
    document.getElementById('date').innerHTML = date.toLocaleDateString('en-US', options);

})()



// User Data
function setUser() {
    localStorage.setItem('user', document.getElementById('name').value);
    document.getElementById('modal').style.display = 'none';
    window.location.reload();
}

(function showUser() {
    const user = localStorage.getItem('user');
    document.getElementById('user').innerText = `${!user ? 'Hey there stranger' : user}`;
})();

// Core Functionalities of To Do List
document.getElementById('list').addEventListener('click', function (event) {
    if (event.target.classList.contains('close')) {
        const div = event.target.parentElement;
        div.remove();

        const resourceUrl = `${api_url}/${div.dataset.id}`;

        fetch(resourceUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
            }
            console.log('Resource deleted successfully');
        }).catch(error => {
            console.error('Error:', error);
        });

    } else if (event.target.tagName.toLowerCase() == 'li' || event.target.classList.contains('task') || event.target.classList.contains('date') || event.target.classList.contains('category')) {

        if (event.target.classList.contains('task') || event.target.classList.contains('date') || event.target.classList.contains('category')) {
            event.target.parentElement.classList.toggle('checked');
            const audio = new Audio('assets/audio/ping.mp3');
            audio.play();
        } else {
            event.target.classList.toggle('checked');
        }

        const resourceUrl = `${api_url}/${event.target.dataset.id}`;

        const updatedData = event.target.dataset.completed == 'true' ? event.target.dataset.completed = 'false' : event.target.dataset.completed = 'true';

        fetch(resourceUrl, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ completed: updatedData }),
        }).then(response => {
            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
            }
            console.log('Resource updated successfully');
        }).catch(error => {
            console.error('Error:', error);
        });


    }
});

// Event delegation for input field keypress
document.getElementById('inputField').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        document.getElementById('add').click();
    }
});

// Function to Create Tasks
function createTaskListItem(task) {
    const li = document.createElement('li');
    li.innerHTML = `<span class='task'>${task.task}</span><span class='date'>${task.date}</span><span class='category'> — ${task.category}</span>`;
    li.dataset.id = task.id;
    li.dataset.completed = task.completed;

    const span = document.createElement('span');
    span.innerHTML = `delete`;
    span.className = 'close material-symbols-outlined';
    li.appendChild(span);

    list.appendChild(li);

    if (task.completed === 'true') {
        li.classList.add('checked');
    }

    return li;
}

// Fetch Data When Page Loads
fetch(api_url)
    .then(response => response.json())
    .then(data => {
        const list = document.getElementById('list');
        data.forEach(task => {
            const li = createTaskListItem(task);
            list.appendChild(li);
        });
    }).catch(error => {
        console.error('Error:', error);
    });

function newTask() {
    const input = document.getElementById('inputField').value;

    if (!input) {
        showError();
        return;
    }

    const category = document.getElementById('category').value;
    const formattedDate = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const task = { task: input, completed: 'false', date: formattedDate, category: category };

    let newId = 1;
    const list = document.getElementById('list');
    const lastChild = list.lastChild;

    if (lastChild && lastChild.dataset && lastChild.dataset.id) {
        newId = parseInt(lastChild.dataset.id) + 1;
    }

    // POST Task to Server
    fetch(api_url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(task),
    }).then(response => {
        if (!response.ok) {
            throw new Error(`Request failed with status ${response.status}: ${response.statusText}`);
        }
        console.log('Resource posted successfully');
    }).catch(error => {
        console.error('Error:', error);
    });

    createTaskListItem(task);
    document.getElementById('inputField').value = null;
}

function showError() {
    const error = document.getElementById('inputField');
    error.placeholder = 'Task cannot be empty.';

    setTimeout(function () {
        error.placeholder = 'Add a task...';
    }, 2000);
}