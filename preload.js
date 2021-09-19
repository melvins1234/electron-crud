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

    // ipcRenderer.on("note-val", (event, arg) => {
    //   arg.sort((a, b) => {
    //     return new Date(b.date) - new Date(a.date);
    //   });
    //   arg.map(e => {
    //     console.log(new Date(e.date) >= new Date());
    //     new Date(e.date).setHours(0, 0, 0, 0) <= new Date().setHours(0, 0, 0, 0) ?
    //       e.date = moment(e.date).format("h:mm A") : e.date = moment(e.date).format("MMM D, YYYY")
    //   })
    //   func(arg)
    // });


  },
  openNewWindow: (data) => {
    ipcRenderer.send(
      "newWindow",
      { file: "file://" + __dirname + "/src/noteWindow.html", data }
    );
    // if(data.action === 'update')
    //   localStorage.setItem('note', JSON.stringify(data))
    // https://stackoverflow.com/questions/45148110/how-to-add-a-callback-to-ipc-renderer-send
  },
  sendUpdateSpecificNote: (data) => {
    ipcRenderer.send("update-specific-note", data)
  },
  updateSpecifiNote: (func) => {
    ipcRenderer.on("specific-note-val", (event, arg) => func(arg))
    ipcRenderer.on("id-val", (event, arg) => func(arg))
  },
  insertNoteToDB: (data) => {
    console.log(data);
    $query = `INSERT INTO note VALUES(${data.id}, '${data.date}', '${data.value}')`;
    connection.query($query, (err, rows, fields) => {
      if (err) {
        console.log("An error ocurred performing the query.");
        console.log(err);
        return;
      }
    });
  },
  updateExistingNote: (func) => {
    ipcRenderer.on("edit-id-val", (event, arg) => func(arg))
  }
});
