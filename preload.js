// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const mysql = require("mysql");
const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener("DOMContentLoaded", () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
  };

  for (const type of ["chrome", "node", "electron"]) {
    replaceText(`${type}-version`, process.versions[type]);
  }
});

const connection = mysql.createConnection({
  // AWS RDS MYSQL Connection
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

// Refresh List

let notes = () => {
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
};

contextBridge.exposeInMainWorld("notes", {
  sendNotesList: () => {
    notes();
  },
  receiveNoteList: (func) => {
    ipcRenderer.on("note-val", (event, arg) => func(arg));
  },
  openNewWindow: (id) => {

    ipcRenderer.send(
      "newWindow",
      {file: "file://" + __dirname + "/src/noteWindow.html", id: id}
    );
  },
  sendUpdateSpecificNote: (data) => {
    ipcRenderer.send("update-specific-note", data)
  },
  updateSpecifiNote: (func) => {
    ipcRenderer.on("specific-note-val", (event, arg) => func(arg))
  }, 
  insertNoteToDB: (data) => {
    $query = `INSERT INTO note VALUES(${data.id}, '${data.date}', '${data.value}')`;
    connection.query($query, (err, rows, fields) => {
      if (err) {
        console.log("An error ocurred performing the query.");
        console.log(err);
        return;
      }
    });
  }
});
