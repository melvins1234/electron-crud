const textarea = document.querySelector(".note__textarea");

let id, value, action;
let typingTimer;

const doneTypingInterval = 3000;

textarea.addEventListener("input", (event) => {
  window.notes.sendUpdateSpecificNote(event.target.value);
});

textarea.addEventListener("keyup", (e) => {
  clearTimeout(typingTimer);
  if (e.target.value) {
    typingTimer = setTimeout(doneTyping, doneTypingInterval);
  }
})

const doneTyping = (e) => {
  window.notes.noteInsertOrUpdateToDB({
    id: id,
    date: new Date(),
    value: textarea.value,
    action: action,
    isEmpty: (textarea.value.trim() === "") ? true : false
  });

  action = 'update'
}

window.onbeforeunload = function (e) {
  if (textarea.value.trim() === "") {
    window.notes.removeDivIfNoteIsBlank({ id: id, isEmpty: true });
  }

  window.notes.noteInsertOrUpdateToDB({
    id: id,
    date: new Date(),
    value: textarea.value,
    action: action,
    isEmpty: (textarea.value.trim() === "") ? true : false
  });
  // return "Please press the Logout button to logout.";
};

window.notes.sampleActions((data) => {
  console.log(data);
  action = data.action;
  if (data.action === "update") {
    textarea.value = data.value;
  }
  id = data.id;
});
