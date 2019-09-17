// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
const { ipcRenderer } = require('electron');

const todoList = document.getElementById('todoList');
const textInput = document.getElementById('textInput');
const todoForm = document.getElementById('todoForm');

todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    ipcRenderer.send('add-todo', textInput.value);
    textInput.value = '';
})

ipcRenderer.on('todos', (e, todos) => {
    // delete the previous content
    todoList.innerHTML = null;

    // render content coming from main process
    todos.forEach((todo) => {
        const todoNode = document.createElement('li');

        if(todo.isDone) {
            todoNode.innerHTML = `<del>${todo.text}</del>`;
        } else {
            todoNode.innerText = todo.text;
        }

        todoNode.addEventListener('click', () => {
            ipcRenderer.send('mark-as-done', todo)
        });
        
        todoNode.addEventListener('contextmenu', () => {
            const isConfirm = confirm(`Are you sure you want to delete "${todo.text}"?`);
            
            if (isConfirm) {
                ipcRenderer.send('delete-todo', todo)

            }
        });

        todoList.appendChild(todoNode);
    })
});

const btnQuit = document.getElementById('btnQuit');
const remote = require('electron').remote;

btnQuit.addEventListener('click', () => {
    remote.getCurrentWindow().close();
})

textInput.focus();