const socket = io('http://localhost:3000');
const messageForm = document.getElementById('send-container');
const messageInput = document.getElementById('message-input');

function appendMessage(message) {
  messageElement = document.createElement('div');
  messageElement.className = "message";
  messageElement.innerHTML = message;
  messageContainer.appendChild(messageElement);
}

function appendMyMessage(message) {
  messageElement = document.createElement('div');
  messageElement.className = "message myMessage";
  messageElement.innerHTML = message;
  messageContainer.appendChild(messageElement);
}

if(messageForm != null){
  const name = document.getElementById('userName').value;

socket.emit('new-user', roomName, name);

messageForm.addEventListener('submit', e => {
  e.preventDefault();
  const message = messageInput.value;
  if(message != ""){
    appendMyMessage(`
    <div class="message-content myMessageColor">
    <img class="other_pic" src="/profile/${actualUserPic}.png">
      ${name} : ${message}
    </div>
    `);
    messageContainer.scrollTop = messageContainer.scrollHeight;
    socket.emit('send-chat-message', roomName, message);
    messageInput.value = "";
  }
})

}

socket.on('chat-message', data => {
  appendMessage(`
  <div class="message-content receivedMessage">
    <img class="other_pic" src="/profile/${data.userPic}.png">
    ${data.name} : ${data.message}
  </div>
  `);
  messageContainer.scrollTop = messageContainer.scrollHeight;
})
