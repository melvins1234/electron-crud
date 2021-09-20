const textarea = document.querySelector(".note__textarea");

let id, value, action;

textarea.addEventListener("input", (event) => {
  window.notes.sendUpdateSpecificNote(event.target.value);
});

window.onbeforeunload = function(e) {
  window.notes.noteInsertOrUpdateToDB({id: id, date: new Date(), value: textarea.value, action: action})
  // return 'Please press the Logout button to logout.';
};

window.notes.sampleActions((data) => {
  console.log(data);
  action = data.action
  if(data.action === 'update') {textarea.value = data.value}
  id = data.id
});