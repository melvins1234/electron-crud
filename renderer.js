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

const generateId = () => { // Generate id base on date today and time
  let now = new Date();
  let id;
  id = now.getFullYear().toString(); // 2011
  id += (now.getMonth < 9 ? '0' : '') + now.getMonth().toString(); // JS months are 0-based, so +1 and pad with 0's
  id += ((now.getDate < 10) ? '0' : '') + now.getDate().toString(); // pad with a 0
  id += ((now.getHours < 10) ? '0' : '') + now.getHours().toString(); // pad with a 0
  id += ((now.getMinutes < 10) ? '0' : '') + now.getMinutes().toString(); // pad with a 0
  id += ((now.getSeconds < 10) ? '0' : '') + now.getSeconds().toString(); // pad with a 0
  id += ((now.getMilliseconds < 10) ? '0' : '') + now.getMilliseconds().toString(); // pad with a 0

  return id;
}

window.notes.receiveNoteList((data) => {
  if (data.length !== 0) noteBlank.remove();

  data.map((collec) => {
    const div = document.createElement("div");
    div.classList.add(`body__sticky-note`);
    div.addEventListener('dblclick', () => {
      window.notes.openNewWindow(collec.id);
    })
    div.id = `${collec.id}`
    div.innerHTML = `
        <p>${collec.value}</p>
        <i class="body__delete fas fa-trash-alt"></i>
        `;

    noteList.appendChild(div);

  });
});
addNote.addEventListener("click", () => {

  let id = generateId();

  const div = document.createElement("div");
  div.classList.add(`body__sticky-note`);
  div.setAttribute(`id`, id);
  div.innerHTML = `
        <p>Take a note... </p>
        <i class="body__delete fas fa-trash-alt"></i>`;
  noteList.insertBefore(div, noteList.firstChild);
  window.notes.openNewWindow(id);
});


window.notes.updateSpecifiNote(data => {
  if (data.value !== null) {
    const noteDiv = document.getElementById(`${data.id}`).querySelector('p')
    noteDiv.textContent = data.value
  } else {
    document.getElementById(`${data.id}`).remove();
  }
})



