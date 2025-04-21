// get all todos
async function loadAllTodos() {
    const response = await fetch('http://localhost:4000/todos');
    const { data } = await response.json(); // Destructure the data property
    return data;
}

// render todo
document.addEventListener('DOMContentLoaded', () => {
    renderTodos();
    renderCategories();
});

async function renderTodos(filteredTodos) {
    const todos = filteredTodos || await loadAllTodos();
    
    let todoHTML = '';
    isChecked();

    if (todos.length) {
        todos.forEach(todo => {

            todoHTML += `
                <div class="todo js-todo-${todo._id} ${todo.completed ? 'completed' : ''}">
                    <div>
                        <input type="checkbox" data-todo-id="${todo._id}" ${todo.completed ? 'checked' : ''}> 
                        <div>
                            <h3>${todo.taskName}</h3>
                            <p>${todo.description ? todo.description : ''}</p>
                        </div>
    
                        <div class="todo-icons">
                            <img src="images/edit.svg" alt="edit" class="js-edit-btn" data-todo-id=${todo._id}>
                            <img src="images/delete.svg" alt="delete" class="js-delete-btn" data-todo-id=${todo._id}>
                        </div>
                    </div>
    
                    <div class="todo-info">
                        <div>
                                <span>${todo.priority}</span>
                                <span>Due: ${todo.deadline}</span>
                        </div>
                            <span>${todo.category}</span>
                        </div>
                </div>
            `;
        });
    } else {
        todoHTML += '<p class="no-task">No tasks found. Add some tasks to get started!</p> ';
    }

    document.querySelector('.js-todos-container')
        .innerHTML = todoHTML;

    addEventListeners();
}

// create a todo
function getTodoData() {
    return {
        taskName: document.querySelector('input[type="text"]').value,
        category: document.querySelector('.js-category-dropdown').value,
        priority: document.querySelector('.js-priority').value,
        description: document.querySelector('textarea').value,
        deadline: document.querySelector('input[type="date"]').value
    };
}


async function createTodo(todoData) {
    try {
        const response = await fetch('http://localhost:4000/create-todo', {
            method: 'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify(todoData) // used to convert it to JSON for the backend
        });
    
        const data = await response.json();
        if (!response.ok) {
            throw new Error(`Server error: ${JSON.stringify(data)}`); 
        }
    
        return data; // i will log the return message in the pop up notification
    } catch (error) {
        throw error;
    }
}

document.querySelector('.js-add-todo-btn')
    .addEventListener('click', async () => {
        const todoData = getTodoData();
        if (todoData.taskName === '') {
            console.log("error: please fill in required fields");
            return;
        }
       await createTodo(todoData); // create new todo
       renderTodos(); // update UI

       clearFields(todoData.category, todoData.deadline, todoData.description, todoData.priority, todoData.taskName
       );

    });


function clearFields(...fields) {
    fields.forEach(field => {
        console.log(field)
        field = '';
    })
}

// filter by categories :: 

// new category
const addNewCategory = document.querySelector('.js-new-category button');
const categoriesElement = document.querySelector('.js-categories-menu');
const dropdownElement = document.querySelector('.js-category-dropdown');


addNewCategory.addEventListener('click', async () => {
    const newCategory = document.querySelector('.new-category input');

    if (newCategory === '') {
        return;
    }

    const existingCategory = document.querySelector(`button[data-category="${newCategory.value.toLowerCase()}"]`);

    if (existingCategory) {
        return;
    }

    await addCategory(newCategory.value);
    newCategory.value = '';
});

async function addCategory(newCategory) {
    try {
        const response = await fetch('http://localhost:4000/addCategory', {
            method: 'POST',
            headers: {
                'Content-Type' : 'application/json'
            },
            body: JSON.stringify({
                category: newCategory
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Server error: ${JSON.stringify(errorData)}`);
        }

        renderCategories();

    } catch (error) {
        throw error;
    }
}

async function getCategories() {
    try {
        const response = await fetch('http://localhost:4000/categories');
        const data = response.json();
        if (!response.ok) {
            throw new Error("Failed to retrieve categories");
        }

        return data;
    } catch (error) {
        throw error;
    }
}


async function renderCategories() {
    const categories = await getCategories();

    if (!categories?.data?.length) { 
        console.warn('Only Predefined categories');
        return;
    } 

    // Reset before adding.
    dropdownElement.innerHTML = '';
    categoriesElement.innerHTML = '';

    
    // Render all categories (predefined + custom)
    categories.data.forEach(item => {
        // Add to the dropdown
        const option = document.createElement('option');
        option.setAttribute('value', item.category);
        option.innerHTML = item.category;

        // Add to the menu for filter
        const button = document.createElement('button');
        button.innerHTML = item.category;
        button.setAttribute('data-category', item.category);

        dropdownElement.appendChild(option);
        categoriesElement.appendChild(button);
    });

    document.querySelectorAll('button[data-category]')
        .forEach(button => {
            button.addEventListener('click', async () => {
                const { category } = button.dataset;
                const todos = await loadAllTodos(); // Fetch all todos
                const filteredTodos = todos.filter(todo => todo.category.toLowerCase() === category.toLowerCase()); // Filter by category

                category === 'All' ? renderTodos() : renderTodos(filteredTodos); // Render only the filtered todos
            });
        });
}


// delete a todo
async function deleteTodo(todoId) {
    try {
        const response = await fetch(`http://localhost:4000/delete/${todoId}`, {
            method: "DELETE"
        });
        if (!response.ok) {
            throw new Error(`Server error`); 
        }
    } catch (error) {
        throw error;
    }
}


function addEventListeners() {
    document.querySelectorAll('.js-delete-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const { todoId } = button.dataset;
            await deleteTodo(todoId);
            renderTodos();
        });
    });

    document.querySelectorAll('.js-edit-btn').forEach(button => {
        button.addEventListener('click', async() => {
            const { todoId } = button.dataset;
            renderEditPage();


            const inputs = document.querySelectorAll('.edit input, .edit textarea');
            const saveChangesbtn = document.querySelector('.js-save-changes');
            inputs.forEach(input => {
                input.addEventListener('input', () => {
                    if (input?.value.trim()) {
                        saveChangesbtn.style.opacity = 1;
                        saveChangesbtn.style.cursor = 'pointer';
                        button.disabled = false;
                    } else {
                        saveChangesbtn.style.opacity = 0.5;
                        saveChangesbtn.style.cursor = 'not-allowed';
                        button.disabled = true;
                    }
                });
            });

            saveChangesbtn.addEventListener('click', async () => {
                await updateTodo(todoId);
                renderEditPage(false);
                renderTodos();
            });
        });
    });

    isChecked();
}

// update todo

function getUpdatedTodoData() {
    const container = document.querySelector('section:nth-of-type(2)');

    // this MUST BE match the order the inputs appear in the HTML :: for effective assignation else the values will get swished arround.
    const [ taskNameInput, descriptionTextarea, categoryDropdown, priorityInput, deadlineInput ] = container.querySelectorAll('input[type="text"], textarea, .js-category-dropdown, .js-priority, , input[type="date"]');


    const newData = {};

    if (taskNameInput.value.trim()) {
        newData.taskName = taskNameInput.value;
    }

    if (descriptionTextarea.value.trim()) {
        newData.description = descriptionTextarea.value;
    }

    if (categoryDropdown.value.trim()) {
        newData.category = categoryDropdown.value;
    }

    if (priorityInput.value.trim()) {
        newData.priority = priorityInput.value;
    }

    if (deadlineInput.value.trim()) {
        newData.deadline = deadlineInput.value;
    }

    return newData;
    
}


async function updateTodo(todoId) {
    try {
        const newTodoData = getUpdatedTodoData();

        const response = await fetch(`http://localhost:4000/update/${todoId}`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'
            },
            body:  JSON.stringify(newTodoData) // converts from JS object to JSON for the backend
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(`Server error: ${JSON.stringify(data)}`);
        }
        return data;
    } catch (error) {
        throw error;;
    }
}


function renderEditPage(display=true) {
    const container = document.querySelector('section:nth-of-type(2)')
    if (display) {
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
    }
    document.querySelector('.js-cancel-edit').addEventListener('click', () => {
        container.style.display = 'none';
    });
}

// .checked

function isChecked() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', async event => {
            const clickedCheckbox = event.target; // This is the specific checkbox that was clicked
            const { todoId } = clickedCheckbox.dataset;
            const completed = clickedCheckbox.checked; // Check if it's checked or not

            const todoElem = document.querySelector(`.js-todo-${todoId}`);

            try {
                // Send the update to the backend
                const response = await fetch(`http://localhost:4000/todos/${todoId}`, {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ completed }) // Send the completed status
                });
          
                const updatedTodo = await response.json();
                console.log('Updated todo:', updatedTodo);

                if (response.ok) {
                    if (completed) {
                        todoElem.classList.add('completed');
                    } else {
                        todoElem.classList.remove('completed');
                    }
                }
            } catch (err) {
                console.error('Failed to update todo:', err);
            }
        });
    });
}