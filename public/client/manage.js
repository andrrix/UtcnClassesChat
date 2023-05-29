const socket = io();

const add_user = document.getElementById('add_user');

function addSubmit(event)
{
  const userInput = document.getElementById("newusr").value;
  console.log(userInput);
  socket.emit("add-user", userInput); // se trimite serverului
  event.preventDefault();
}

add_user.addEventListener("submit", addSubmit);

const delete_user = document.getElementById("delete_user");

function deleteSubmit(event)
{
  const userInput = document.getElementById("newusr").value;
  console.log(userInput);
  socket.emit("delete-user", userInput); // se trimite serverului
  event.preventDefault();
}

delete_user.addEventListener("submit", deleteSubmit);

const update_user = document.getElementById("update-user");

function updateSubmit(event)
{
  const newUser = document.getElementById("changeusr").value;
  const oldUser = document.getElementById("newusr").value;
  console.log(newUser);
  console.log(oldUser);
  socket.emit("update-user", {oldUser,newUser}); // se trimite serverului
  event.preventDefault();
}

update_user.addEventListener("submit", updateSubmit);

