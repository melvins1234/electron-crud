const textarea = document.querySelector(".note__textarea");

let id, value;

textarea.addEventListener("input", (event) => {
  window.notes.sendUpdateSpecificNote(event.target.value);
});

window.notes.updateSpecifiNote((data) => {
  id = data.id;
  value = data.value;
});

window.addEventListener("beforeunload", (e) => {
    e.preventDefault();
    window.notes.insertNoteToDB({id: id, date: new Date(), value: value})
});
