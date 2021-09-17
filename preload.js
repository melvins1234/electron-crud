// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

const mysql = require("mysql");
const { contextBridge, ipcRenderer } = require("electron");

const connection = mysql.createConnection({
  host: "onestoptech.cai20tt60bsf.ap-southeast-1.rds.amazonaws.com",
  user: "onestoptech",
  password: "password",
  database: "sticky_note",
});

connection.connect((err) => {
  if (err) {
    console.log(err.code);
    console.log(err.fatal);
  }
});

contextBridge.exposeInMainWorld("notes", {
  sendNotesList: () => {
    // Perform a query
    $query = `SELECT * FROM note`;

    connection.query($query, (err, rows, fields) => {
      if (err) {
        console.log("An error ocurred performing the query.");
        console.log(err);
        return;
      }
      ipcRenderer.send("note-list", rows);
    });
    // ipcRenderer.send("note-list", rows);
    connection.end(() => {});
  },
  receiveNoteList: (func) => {
    ipcRenderer.on("note-val", (event, arg) => func(...arg));
  },
});
