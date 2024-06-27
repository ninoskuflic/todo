// API Endpoint
const api_url = 'https://api.edu.skuflic.com/tasks'; // Base URL for the API

// Global Variables
const date = new Date(); // Current date and time
const audio = new Audio('assets/audio/ping.mp3'); // Audio file to be played
const options = { month: 'long', day: 'numeric', year: 'numeric' }; // Options for formatting dates

// Function to get a specific cookie by name
function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null; // Return the cookie value if found, else null
}

// Function to set a cookie with a name, value, and expiration in days
function setCookie(name, value, days) {
  let localDateObject = new Date();
  localDateObject.setTime(
    localDateObject.getTime() + days * 24 * 60 * 60 * 1000
  );
  const expires = 'expires=' + localDateObject.toUTCString();
  document.cookie = `${name}=${value};${expires};path=/`;
}

// Setting the due date input to the current date and displaying the current date
document.getElementById('due-date').valueAsDate = date;
document.getElementById('date').innerHTML = date.toLocaleDateString(
  'en-US',
  options
);

// Enabling dark mode if previously set in localStorage
if (localStorage.getItem('dark-mode') == 'enabled') {
  enableDarkMode();
}

// Function to enable or toggle dark mode
function enableDarkMode() {
  document.body.classList.toggle('dark');
  const darkMode = document.getElementById('dark-mode');
  document.getElementById('loading').style.backgroundColor = '#121212';
  document.querySelector('.percentage').style.color = '#FFF';
  darkMode.innerHTML === 'Enable Dark Mode'
    ? (darkMode.innerHTML = 'Disable Dark Mode')
    : (darkMode.innerHTML = 'Enable Dark Mode');
}

// Toggle dark mode on button click and update localStorage
document.getElementById('dark-mode').addEventListener('click', function () {
  enableDarkMode();
  localStorage.getItem('dark-mode') == 'enabled'
    ? localStorage.setItem('dark-mode', 'disabled')
    : localStorage.setItem('dark-mode', 'enabled');
});

// Hide the top bar and set a cookie when the top bar is clicked
const topbar = document.getElementById('top-bar-hide');
topbar.addEventListener('click', function () {
  document.querySelector('.top-bar').style.display = 'none';
  localStorage.setItem('cookie-notice', 'closed');
});

// Hide the top bar if the cookie is already set
if (localStorage.getItem('cookie-notice') == 'closed') {
  document.querySelector('.top-bar').style.display = 'none';
}

// Logo Animation using anime.js library
const progressLogEl = document.querySelector('.percentage');
anime({
  targets: '.loading .el',
  direction: 'alternate',
  loop: false,
  duration: 1000,
  easing: 'easeInOutCirc',
  update: function (anim) {
    progressLogEl.innerHTML = Math.round(anim.progress) + '%';
  },
});

// Hide the loading screen after the animation is done
setTimeout(() => {
  document.getElementsByClassName('loading')[0].style.display = 'none';
}, 1000);

// Modal functionality
const modal = document.getElementById('modal');
const button = document.getElementById('button');
const span = document.querySelector('.close-modal');

// Show the modal
function showModal() {
  modal.style.display = 'block';
}

// Hide the modal
function hideModal() {
  modal.style.display = 'none';
}

// Event listeners for modal interactions
button.addEventListener('click', showModal);
span.addEventListener('click', hideModal);
window.addEventListener('click', function (event) {
  if (event.target === modal) {
    console.log(event.target); // Object reference
    hideModal();
  }
});

// Display the current year in the footer
document.getElementById('year').innerText = date.getFullYear();

// Greeting based on the time of day and setting the appropriate icon
(function () {
  const hour = date.getHours();
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
})();

// Function to set the user's name in localStorage and reload the page
function setUser() {
  let user = document.getElementById('name');
  localStorage.setItem('user', user.value);
  document.getElementById('user').innerHTML = user.value;
  user.value = null;
  hideModal();
}

// Display the user's name or a default greeting if no user is set
(function showUser() {
  const user = localStorage.getItem('user');
  document.getElementById('user').innerText = `${
    !user ? 'Hey there stranger' : user
  }`;
})();

// Function to handle the deletion of a task
function handleResourceDeletion(element) {
  fetch(`${api_url}/${element.dataset.id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      } else {
        element.remove(); // Remove the task element from the DOM
        checkEmpty(); // Check if the task list is empty
        console.log('Resource deleted successfully');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Event listener for task list interactions
document.getElementById('list').addEventListener('click', (event) => {
  if (event.target.classList.contains('close')) {
    handleResourceDeletion(event.target.parentElement); // Handle task deletion
  } else {
    const clickedElement = event.target;

    // Find the closest li element to the clicked target
    const listItem = clickedElement.closest('li');
    listItem.classList.toggle('checked'); // Toggle the 'checked' class
    listItem.classList.remove('overdue'); // Remove the 'overdue' class if present

    // Check if the task is completed and overdue
    if (listItem.dataset.completed !== 'false') {
      Date.parse(listItem.dataset.due) < date &&
        listItem.classList.add('overdue');
    } else {
      audio.play(); // Play the audio if the task is newly completed
    }

    // Toggle the task completion status
    const taskCompletionStatus =
      listItem.dataset.completed == 'true'
        ? (listItem.dataset.completed = 'false')
        : (listItem.dataset.completed = 'true');

    // Update the task status on the server
    fetch(`${api_url}/${listItem.dataset.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ completed: taskCompletionStatus }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(
            `Request failed with status ${response.status}: ${response.statusText}`
          );
        } else {
          console.log('Resource updated successfully');
        }
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }
});

// Event listener for pressing 'Enter' in the input field
document
  .getElementById('inputField')
  .addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
      event.preventDefault(); // Prevent the default action
      document.getElementById('add').click(); // Trigger the add button click
    }
  });

// Function to create a new task list item element
function createTaskListItem(task) {
  const li = document.createElement('li');
  const formattedDate = new Date(task.due);

  li.innerHTML = `
    <span class='task' data-id='${task.id}'>${task.task}</span>
    <span class='date' data-id='${task.id}'>Added ${task.date}${
    task.due && ` — Due ${formattedDate.toLocaleDateString('en-US', options)}`
  }</span>
    <span class='category ${task.category
      .toLowerCase()
      .split(' ')
      .join('-')}' data-id='${task.id}'>${task.category}</span>
    <span class='close material-symbols-outlined'>delete</span>
    `;

  li.dataset.id = task.id;
  li.dataset.due = task.due;
  li.dataset.completed = task.completed;

  formattedDate < date &&
    task.completed !== 'true' &&
    li.classList.add('overdue'); // Add 'overdue' class if the task is overdue
  task.completed === 'true' && li.classList.add('checked'); // Add 'checked' class if the task is completed

  list.appendChild(li);
  checkEmpty(); // Check if the task list is empty
  return li;
}

// Fetch and display tasks when the page loads
fetch(api_url)
  .then((response) => response.json())
  .then((data) => {
    const list = document.getElementById('list');
    data.forEach((task) => {
      const li = createTaskListItem(task); // Create and append each task item
      list.appendChild(li);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });

// Function to add a new task
function newTask() {
  const input = document.getElementById('inputField').value;
  const due = document.getElementById('due-date').value;

  if (!input) {
    showError(); // Show error if the input is empty
    return;
  }
  let newId = 1;
  const list = document.getElementById('list');
  const lastChild = list.lastChild;

  if (lastChild && lastChild.dataset && lastChild.dataset.id) {
    newId = parseInt(lastChild.dataset.id) + 1;
  }

  const category = document.getElementById('category').value;
  const formattedDate = date.toLocaleDateString('en-US', options);
  const task = {
    task: input,
    completed: 'false',
    date: formattedDate,
    category: category,
    id: newId,
    due: due,
  };

  // POST new task to the server
  fetch(api_url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(task),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      } else {
        createTaskListItem(task); // Create and append the new task item
        document.getElementById('inputField').value = null; // Clear the input field
        console.log('Resource posted successfully');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

// Show an error message if the input field is empty
function showError() {
  const error = document.getElementById('inputField');
  error.placeholder = 'Task cannot be empty.';

  setTimeout(function () {
    error.placeholder = 'Add a task...';
  }, 2000);
}

// Check if the task list is empty and show/hide the empty message
function checkEmpty() {
  if (document.getElementById('list').childNodes.length > 0 == true) {
    document.getElementById('empty').style.display = 'none';
  } else {
    document.getElementById('empty').style.display = 'initial';
  }
}
