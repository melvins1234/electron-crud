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

window.notes.receiveNoteList((data) => {
  if (data.length !== 0) noteBlank.remove();

  data.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  data.map((collec) => {
    const div = document.createElement("div");
    div.classList.add(`body__sticky-note`);
    div.innerHTML = `
        <p>${collec.value}</p>
      
              <i           
                class="body__delete fas fa-trash-alt"
              ></i>`;

    noteList.appendChild(div);
  });
});
addNote.addEventListener("click", () => {
    let id = new Date().valueOf();
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
  if(data.value !== null){
    const noteDiv = document.getElementById(`${data.id}`).querySelector('p')
  noteDiv.textContent = data.value
  }else{
    document.getElementById(`${data.id}`).remove();
  }
})