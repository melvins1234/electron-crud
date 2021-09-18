const textarea = document.querySelector(".note__textarea");

let id, value;

textarea.addEventListener("input", (event) => {
  window.notes.sendUpdateSpecificNote(event.target.value);
});

window.notes.updateSpecifiNote((data) => {
  console.log(data);
  id = data.id;
  value = data.value;
});

window.onbeforeunload = function(e) {
  window.notes.insertNoteToDB({id: id, date: new Date(), value: textarea.value})
  // return 'Please press the Logout button to logout.';
};

