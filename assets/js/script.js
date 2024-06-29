// Global Variables
const api_url = 'https://api.edu.skuflic.com/tasks'; // Base URL for the API
const date = new Date(); // Current date and time
const audio = new Audio('assets/audio/ping.mp3'); // Audio file to be played
const options = { month: 'long', day: 'numeric', year: 'numeric' }; // Options for formatting dates

function enableDarkMode() {
  document.body.classList.toggle('dark');
  const darkMode = document.getElementById('dark-mode');
  document.getElementById('loading').style.backgroundColor = '#121212';
  document.querySelector('.percentage').style.color = '#FFF';
  darkMode.innerHTML === 'Enable Dark Mode'
    ? (darkMode.innerHTML = 'Disable Dark Mode')
    : (darkMode.innerHTML = 'Enable Dark Mode');
}

function showModal() {
  modal.style.display = 'block';
}

function hideModal() {
  modal.style.display = 'none';
}

function setUser() {
  let user = document.getElementById('name');
  localStorage.setItem('user', user.value);
  document.getElementById('user').innerHTML = user.value;
  user.value = null;
  hideModal();
}

function editTask() {
  // Update the task status on the server
  let id = document.getElementById('edit-task').dataset.id;
  let due = document.getElementById('edit-due-date').value;
  let category = document.getElementById('edit-category').value;
  let task = document.getElementById('edit-task').value;

  if (!task) {
    const error = document.getElementById('edit-task');
    error.placeholder = 'Task cannot be empty.';

    setTimeout(function () {
      error.placeholder = 'Add a task...';
    }, 2000);
    return;
  }

  const taskObject = {
    id: id,
    task: task,
    due: due,
    category: category,
  };

  fetch(`${api_url}/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(taskObject),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error(
          `Request failed with status ${response.status}: ${response.statusText}`
        );
      } else {
        location.reload();
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function deleteTask(element) {
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
        checkForEmptyTaskList(); // Check if the task list is empty
        console.log('Resource deleted successfully');
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function findParentWithDatasetId(element) {
  let currentElement = element;
  while (currentElement) {
    if (currentElement.dataset && currentElement.dataset.id) {
      return currentElement;
    }
    currentElement = currentElement.parentElement;
  }
  return null; // If no parent with dataset.id is found
}

function addTask() {
  const input = document.getElementById('input').value;
  const due = document.getElementById('due-date').value;
  const category = document.getElementById('category').value;

  if (!input) {
    showError(); // Show error if the input is empty
    return;
  }

  let newId = 1;
  const list = document.getElementById('list');
  const lastChild = list.lastChild;

  if (lastChild?.dataset?.id) {
    newId = parseInt(lastChild.dataset.id) + 1;
  }

  const task = {
    task: input,
    completed: 'false',
    date: date.toLocaleDateString('en-US', options),
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
        createTask(task); // Create and append the new task item
        document.getElementById('input').value = null; // Clear the input field
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function createTask(task) {
  const li = document.createElement('li');
  const formattedDate = new Date(task.due).toLocaleDateString('en-US', options);

  li.innerHTML = `
    <div class='task-holder'>
      <span class='task'>${task.task}</span>
      
      <span class='date'>Added ${task.date} ${
    task.due && ` — Due ${formattedDate}`
  }
      </span>

      <span class='category ${task.category
        .toLowerCase()
        .split(' ')
        .join('-')}'>${task.category}
      </span>
    </div>

    <div class='action-holder'>
      <div id='edit'>
        <span class='material-symbols-outlined edit'>
        edit
        </span>
      </div>

      <div>
        <span class='material-symbols-outlined close'>delete</span>
      </div>
    </div>
    `;

  li.dataset.id = task.id;
  li.dataset.due = task.due;
  li.dataset.category = task.category;
  li.dataset.completed = task.completed;

  Date.parse(li.dataset.due) < date &&
    task.completed !== 'true' &&
    li.classList.add('overdue');

  task.completed === 'true' && li.classList.add('checked'); // Add 'checked' class if the task is completed

  list.appendChild(li);
  checkForEmptyTaskList(); // Check if the task list is empty
  return li;
}

function showError() {
  const error = document.getElementById('input');
  error.placeholder = 'Task cannot be empty.';

  setTimeout(function () {
    error.placeholder = 'Add a task...';
  }, 2000);
}

function checkForEmptyTaskList() {
  if (document.getElementById('list').childNodes.length > 0 == true) {
    document.getElementById('empty').style.display = 'none';
  } else {
    document.getElementById('empty').style.display = 'initial';
  }
}

// Event Listeners
document.getElementById('dark-mode').addEventListener('click', function () {
  enableDarkMode();
  localStorage.getItem('dark-mode') == 'enabled'
    ? localStorage.setItem('dark-mode', 'disabled')
    : localStorage.setItem('dark-mode', 'enabled');
});

const topbar = document.getElementById('top-bar-hide');
topbar.addEventListener('click', function () {
  document.querySelector('.top-bar').style.display = 'none';
  localStorage.setItem('cookie-notice', 'closed');
});

document.getElementById('button').addEventListener('click', showModal);
const closeModalButtons = document.querySelectorAll('.close-modal');

// Add an event listener to each element
closeModalButtons.forEach((button) => {
  button.addEventListener('click', hideModal);
});

window.addEventListener('click', function (event) {
  if (event.target === modal) {
    console.log(event.target); // Object reference
    hideModal();
  }
});

document.getElementById('list').addEventListener('click', (event) => {
  const parentWithId = findParentWithDatasetId(event.target);
  if (event.target.classList.contains('close')) {
    deleteTask(parentWithId); // Handle task deletion
  } else if (event.target.classList.contains('edit')) {
    document.getElementById('edit-modal').style.display = 'initial';

    const parentTask = parentWithId.querySelector('.task');

    document.getElementById('edit-task').value = parentTask.innerText;
    document.getElementById('edit-task').dataset.id = parentWithId.dataset.id;

    document.getElementById('edit-category').value =
      parentWithId.dataset.category;

    document.getElementById('edit-due-date').value = parentWithId.dataset.due;
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

document.getElementById('input').addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    event.preventDefault(); // Prevent the default action
    document.getElementById('add').click(); // Trigger the add button click
  }
});

// Initial Setup and API Calls
document.getElementById('due-date').valueAsDate = date;
document.getElementById('date').innerHTML = date.toLocaleDateString(
  'en-US',
  options
);

// Check if dark mode has been enabled by the user
if (localStorage.getItem('dark-mode') == 'enabled') {
  enableDarkMode();
}

// Check if the cookie notice has been closed by the user
if (localStorage.getItem('cookie-notice') == 'closed') {
  document.querySelector('.top-bar').style.display = 'none';
}

// Add current year to the footer
document.getElementById('year').innerText = date.getFullYear();

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

/**
 * SHOW USER
 * This function shows the user's name if set by user, otherwise it will show the default name of the user
 */
(function showUser() {
  const user = localStorage.getItem('user');
  document.getElementById('user').innerText = `${
    !user ? 'Hey there stranger' : user
  }`;
})();

/**
 * LOADING ANIMATION
 * This function animates the loading screen when the app is opened
 */
const loadingPercentage = document.querySelector('.percentage');
anime({
  targets: '.loading .el',
  direction: 'alternate',
  loop: false,
  duration: 1000,
  easing: 'easeInOutCirc',
  update: function (anim) {
    loadingPercentage.innerHTML = Math.round(anim.progress) + '%';
  },
});

/**
 * REMOVE LOADING SCREEN
 * This method removes the loading screen after 1 second
 */
setTimeout(() => {
  document.querySelector('.loading').style.display = 'none';
}, 1000);

/**
 * FETCH INITIAL DATA
 * This function get's the initial data from the API and populates the task list
 */
fetch(api_url)
  .then((response) => response.json())
  .then((data) => {
    const list = document.getElementById('list');
    data.forEach((task) => {
      const li = createTask(task); // Create and append each task item
      list.appendChild(li);
    });
  })
  .catch((error) => {
    console.error('Error:', error);
  });
