// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.notes.sendNotesList();

const addNote = document.querySelector(".header__icon");
const noteList = document.querySelector(".body__notes-list");
const noteBlank = document.querySelector(".body__blank");

const generateId = () => {
  // Generate id base on date today and time
  let now = new Date();
  let id;
  id = now.getFullYear().toString(); // 2011
  id += (now.getMonth < 9 ? "0" : "") + now.getMonth().toString(); // JS months are 0-based, so +1 and pad with 0's
  id += (now.getDate < 10 ? "0" : "") + now.getDate().toString(); // pad with a 0
  id += (now.getHours < 10 ? "0" : "") + now.getHours().toString(); // pad with a 0
  id += (now.getMinutes < 10 ? "0" : "") + now.getMinutes().toString(); // pad with a 0
  id += (now.getSeconds < 10 ? "0" : "") + now.getSeconds().toString(); // pad with a 0
  id +=
    (now.getMilliseconds < 10 ? "0" : "") + now.getMilliseconds().toString(); // pad with a 0

  return id;
};

window.notes.receiveNoteList((data) => {
  if (data.length !== 0) noteBlank.remove();
  data.map((collec) => {
    const div = document.createElement("div");
    const i = document.createElement("i");
    i.className = "body__delete fas fa-trash-alt";

    div.classList.add(`body__sticky-note`);
    i.addEventListener("click", () => {
      window.notes.deleteNoteToDB(collec.id);
      const noteDiv = document.getElementById(`${collec.id}`);
      noteDiv.remove();
      if (div.getAttribute('aria-label') !== 0 && div.getAttribute('aria-label') !== null) {
        window.notes.closeOpenedWindow(parseInt(div.getAttribute('aria-label')))
      }
    });
    div.id = `${collec.id}`;
    div.innerHTML = `
        <p>${collec.value}</p>
        `;
    div.appendChild(i);
    noteList.appendChild(div);
  });
});
addNote.addEventListener("click", () => {
  let id = generateId();
  if (document.querySelector(".body__blank")) {
    document.querySelector(".body__blank").remove();
  }
  let openNewWindow = async () => {
    let response = await window.notes.openNewWindow({ id: id, action: "add" });
    const div = document.createElement("div");
    const i = document.createElement("i");
    i.className = "body__delete fas fa-trash-alt";

    div.classList.add(`body__sticky-note`);
    div.setAttribute(`id`, id);
    div.setAttribute("aria-label", response);
    div.innerHTML = `
        <p>Take a note... </p>`;
    i.addEventListener("click", () => {
      window.notes.deleteNoteToDB(id);
      const noteDiv = document.getElementById(`${id}`);
      noteDiv.remove();
      window.notes.closeOpenedWindow(response)
    });
    div.appendChild(i);
    noteList.insertBefore(div, noteList.firstChild);
  };
  openNewWindow().then(() => {
    setTimeout(() => {
      window.notes.sampleAction({
        id: id,
        action: "add",
      });
    }, 500);
  });
});

window.notes.updateSpecifiNote((data) => {
  if (data.value !== "") {
    if (document.getElementById(`${data.id}`)) {
      const noteDiv = document.getElementById(`${data.id}`).querySelector("p");
      noteDiv.textContent = data.value;
    } else {
      const div = document.createElement("div");
      div.classList.add(`body__sticky-note`);
      div.setAttribute(`id`, id);
      // div.setAttribute("aria-label", response);
      div.innerHTML = `
          <p>Take a note... </p>
          <i class="body__delete fas fa-trash-alt"></i>`;
      noteList.insertBefore(div, noteList.firstChild);
    }
  } else {
    console.log(data);
    document.getElementById(`${data.id}`).querySelector("p").textContent =
      "Take a note... ";
  }
});

window.notes.removeDiv((data) => {
  const noteDiv = document.getElementById(`${data.id}`);
  noteDiv.remove();

  let div = document.createElement("div");
  div.classList.add("body__blank");

  div.innerHTML = `<img class="body__image" src="../assets/images/note.svg" alt=""></img>
  <p>Tap the new note button above to create a note.</p>`;

  if (document.querySelector(".body__notes-list").childElementCount <= 0) {
    document.querySelector('.body').insertBefore(div, document.querySelector('.body').firstChild);
  }
});


document.addEventListener('dblclick', function (e) {
  if (e.target.className.split(' ').indexOf('body__sticky-note') > -1) {
    let id = e.target.getAttribute('id');
    let value = e.target.querySelector('p').textContent
    let response = 0;
    let noteContent = async () => {
      response = await window.notes.openNewWindow({
        id,
        action: "update",
        value,
      });
    };

    noteContent().then(() => {
      e.target.setAttribute("aria-label", response);
      setTimeout(() => {
        window.notes.sampleAction({
          id,
          action: "update",
          value,
        });
      }, 500);
    });
  }
})