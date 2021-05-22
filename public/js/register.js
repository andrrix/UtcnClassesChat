const newuser = document.getElementById("user_register");

const socket = io();

newuser.addEventListener("submit", (e) => {
  e.preventDefault();

  // Get username 
  let usr = e.target.elements.newusr.value; // se preia mesajul introdus

  usr = usr.trim();

  if (!usr) {
    return false;
  }

  // Emit message to server
  socket.emit("userRegister", usr); // se trimite serverului
});

