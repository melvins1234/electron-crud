// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const mysql = require("mysql");
const { contextBridge, ipcRenderer } = require("electron");
const moment = require("moment");

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

let connection = mysql.createConnection({
  // AWS RDS MYSQL Connection
  host: "localhost",
  user: "root",
  password: "Password@123",
  database: "sticky_note",
});

connection.connect((err) => {
  if (err) {
    console.log(err.code);
    console.log(err.fatal);
  }
});


// Refresh List
contextBridge.exposeInMainWorld("notes", {
  sendNotesList: () => {
    // createConnection(); // Start Connection
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

    // Close the connection
    // connection.end(function () {
    //   // The connection has been closed
    // });
  },
  receiveNoteList: (func) => {
    ipcRenderer.on("note-val", (event, arg) => func(arg));
  },
  openNewWindow: async (data) => {
    let id = await ipcRenderer.invoke("newWindow", {
      file: "file://" + __dirname + "/src/noteWindow.html",
      data,
    });
    return id;
  },
  sendUpdateSpecificNote: (data) => {
    ipcRenderer.send("update-specific-note", data);
  },
  updateSpecifiNote: (func) => {
    ipcRenderer.on("specific-note-val", (event, arg) => func(arg));
    ipcRenderer.on("id-val", (event, arg) => func(arg));
  },
  noteInsertOrUpdateToDB: (data) => {
    if (!data.isEmpty) {
      if (data.action === "add") {
        $query = `INSERT INTO note VALUES(${data.id}, '${data.date}', '${data.value}')`;
      } else {
        $query = `UPDATE note
        SET date = '${data.date}', value= '${data.value}'
        WHERE id = ${data.id};`;
      }
    } else {
      $query = `DELETE FROM note WHERE id=${data.id}`;
    }

    connection.query($query, (err, rows, fields) => {
      if (err) {
        console.log("An error ocurred performing the query.");
        console.log(err);
        return;
      }
    });
  },
  updateExistingNote: (func) => {
    ipcRenderer.on("edit-id-val", (event, arg) => func(arg));
  },
  deleteNoteToDB: (data) => {
    $query = `DELETE FROM note WHERE id=${data}`;
    connection.query($query, (err, rows, fields) => {
      if (err) {
        console.log("An error ocurred performing the query.");
        console.log(err);
        return;
      }
    });
  },
  sampleAction: (data) => {
    ipcRenderer.send("an-action", data);
  },
  sampleActions: (func) => {
    ipcRenderer.on("test-val", (event, arg) => func(arg));
  },
  removeDivIfNoteIsBlank: (isEmpty) => {
    ipcRenderer.send("remove-div-action", isEmpty);
  },
  removeDiv: (isEmpty) => {
    ipcRenderer.on("textarea-val", (event, arg) => isEmpty(arg));
  },
  closeOpenedWindow: (browserWindowId) => {
    ipcRenderer.send("close-window-action", browserWindowId)
  }
});
