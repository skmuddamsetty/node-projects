const socket = io();
// socket.on('countUpdated', count => {
//   console.log('The count has been updated', count);
// });

// document.querySelector('#increment').addEventListener('click', () => {
//   console.log('clicked');
//   socket.emit('increment'); // updating the server that an event happened
// });

// Elements
const $messageForm = document.querySelector('#message-form');
const $messageFormInput = $messageForm.querySelector('input');
const $messageFormButton = $messageForm.querySelector('button');
const $sendLocationButton = document.querySelector('#send-location');
const $messages = document.querySelector('#messages');

// Templates
const $messageTemplate = document.querySelector('#message-template').innerHTML;
const $locationTemplate = document.querySelector('#location-template')
  .innerHTML;
const $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// Options
const { username, roomname } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
const autoScroll = () => {
  // new message element
  const $newMessage = $messages.lastElementChild;
  // get the height of the new message
  const newMessageStyles = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyles.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;
  // get the visible height
  const visibleHeight = $messages.offsetHeight;
  // height of messages container
  const containerHeight = $messages.scrollHeight;
  // figure out how far down we have scrolled
  const scrollOffSet = $messages.scrollTop + visibleHeight;
  if (containerHeight - newMessageHeight <= scrollOffSet) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};

socket.on('message', message => {
  const html = Mustache.render($messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('locationMessage', message => {
  const html = Mustache.render($locationTemplate, {
    username: message.username,
    url: message.url,
    createdAt: moment(message.createdAt).format('h:mm A')
  });
  $messages.insertAdjacentHTML('beforeend', html);
  autoScroll();
});

socket.on('roomData', ({ roomname, users }) => {
  const html = Mustache.render($sidebarTemplate, {
    roomname,
    users
  });
  document.querySelector('#side-bar').innerHTML = html;
});

$messageForm.addEventListener('submit', e => {
  e.preventDefault();
  $messageFormButton.setAttribute('disabled', 'disabled');
  // const message = document.querySelector('input').value;
  const message = e.target.elements.message.value;
  // emits the message that the user has typed in the textbox
  // third param i.e., a callback that will be executed when the server responds with this event
  socket.emit('sendMessage', message, error => {
    $messageFormButton.removeAttribute('disabled');
    $messageFormInput.value = '';
    $messageFormInput.focus();
    if (error) {
      return console.log(error);
    }
    console.log('the message was delivered');
  });
});

$sendLocationButton.addEventListener('click', () => {
  if (!navigator.geolocation) {
    return alert('Geolocation is not supported by your browser');
  }
  $sendLocationButton.setAttribute('disabled', 'disabled');
  navigator.geolocation.getCurrentPosition(position => {
    socket.emit(
      'sendLocation',
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      () => {
        console.log('Location shared successfully!');
        $sendLocationButton.removeAttribute('disabled');
      }
    );
  });
});

socket.emit('join', { username, roomname }, error => {
  if (error) {
    alert(error);
    location.href = '/';
  }
});
