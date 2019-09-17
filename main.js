// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron');
const path = require('path');
const Store = require('electron-store');

const store = new Store({ name: 'todos' });
let currentTodos = store.get('todos');

store.set('todos', currentTodos);

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    }
  })

  // and load the index.html of the app.
  mainWindow.loadFile('index.html');

  // FOR DEBUG
  // mainWindow.webContents.openDevTools();
  
  
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('todos', currentTodos);
  });

  // send todo's to the renderer everytime they are updated
  store.onDidChange('todos', () => {
    mainWindow.webContents.send('todos', currentTodos);
  })

  ipcMain.on('add-todo', (e, text) => {
    const duplicateTodos = store.get('todos').filter(td => (td.text === text));
    // only add if there are NO duplicates:
    if (duplicateTodos.length === 0) {
      currentTodos = [...store.get('todos'), { text , isDone: false }];
      store.set('todos', currentTodos);
    };
  })

  ipcMain.on('mark-as-done', (e, todo) => {
    const updatedTodos = store.get('todos').map(td => {
      if(td.text === todo.text) {
        td.isDone = !td.isDone;
      }
      return td;
    });
    // save to the store
    currentTodos = updatedTodos;
    store.set('todos', updatedTodos);
  })
  
  ipcMain.on('delete-todo', (e, todo) => {
    const updatedTodos = store.get('todos').filter(td => (td.text !== todo.text));
    // save to the store
    currentTodos = updatedTodos;
    store.set('todos', updatedTodos);
  })

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) createWindow()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
