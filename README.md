1. Start with the `electron-quick-start` repo:
```
git clone https://github.com/electron/electron-quick-start
```
After cloning run `yarn install` and `yarn start` to check if everything is working. A window should popup.

2. Add a form
```html
<form id="todoForm">
    <input id="textInput" type="text">
    <input type="submit" value="Add">
</form>
```

3. Store the ToDo's in a `todos.json` file.
Let's use `electron-store` for this -> https://github.com/sindresorhus/electron-store
The configuration should be in `main.js`.

```javascript
const store = new Store({ name: 'todos' });
let myTodos = store.get('todos');

store.set('todos', myTodos);
```
*Tip:* For now add two example ToDo's (instead of `store.get('todos')`)
and check if they show up in `todos.json`

```javascript
let myTodos = [
    { text: 'buy present for bae', isDone: false },
    { text: 'wash car', isDone: true },
];
```

The `.json` will be a in a different place depending on your OS:
```
Linux: ~/.config/<App Name>
Mac OS: ~/Library/Application Support/<App Name>
Windows: C:\Users\<user>\AppData\Local\<App Name>
```

4. Send the `todos` from the main process to the renderer
Wait for the `on-finish-load` event to do this.
```javascript
mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send(
        'todos',
        //your todos from the store
    );
  });
```
This will emit a `todos` event that the render process can listen to.

5. Listen to the `todos` event in `renderer.js`
```javascript
ipcRenderer.on('todos', (e, todos) => {
    // show all todos in a <ul>
});
```
6. Show a list of `todo`s
Add a `<ul>` in `index.html`
```html
<ul id="todoList"></ul>
```
Populate the `<ul>` with `<li>`s. If a task is done ~~scratch it~~:
```html
<li><del>wash car</del></li>
```

7. Click a `todo` to mark it as done
Add a `click` event listener to each `todo`. This should send a `mark-as-done` event to the main process.
```javascript
ipcRenderer.send('mark-as-done', todo)
```

8. Listen to `mark-as-done` in the main process.
Here we get all the todos in the store and update the one we clicked.
Then we save the to the store.
```javascript
ipcMain.on('mark-as-done', (e, todo) => {
    const updatedTodos = store.get('todos').map(td => {
      if(td.text === todo.text) {
        td.isDone = !td.isDone;
      }
      return td;
    });
    // save to the store
    store.set('todos', updatedTodos);
  })
```

9. Send the updated `todo`s to the render process
You can `event.reply('todos', updatedTodos)` *but*
The best solution here is to *listen to changes in the store* using `.onDidChange()`
https://github.com/sindresorhus/electron-store#ondidchangekey-callback

10. Add ToDo's using the `<form>`
Send a `add-todo` event to the main process with a payload `text`:
```javascript
ipcRenderer.send('add-todo', text)
```

11. Delete ToDo's by right clicking each `<li>`
Tip: Listen to the browser event `contextmenu` in the renderer. Repeat the flow that you did in the previous actions: send a `delete-todo` from the `renderer` to `main` -> listen to `delete-todo` in `main` -> find the one you want to delete and update the store.

12. Build your app using `electron-builder`
```
yarn add electron-builder --dev
```

Add the necessary metadata to `package.json`
Docs here: https://www.electron.build/configuration/configuration#metadata
```
"author": "Diogo <diogofgr@gmail.com>",
"homepage": "https://myTodoApp.com",
```
Add a `build` script:
```
"build:linux": "electron-builder --linux"
```

Build it!
```
yarn build:linux
```