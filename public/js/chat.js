const $messageForm = document.querySelector("#message-form");
const $messageFormInput = $messageForm.querySelector("input");
const $messageFormButton = $messageForm.querySelector("button");
const $sendLocation = document.querySelector("#send-location");
const $container = document.querySelector("#container");
const $locationContainer = document.querySelector("#location-container");

// Templates
const $messageTemplate = document.querySelector("#message-template").innerHTML;
const $locationTemplate =
  document.querySelector("#location-template").innerHTML;
const $sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const { message, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const autoScroll = () => {
  const $newMessage = $container.lastElementChild;

  const newMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = $container.offsetHeight;
  const containerHeight = $container.scrollHeight;
  const scrollOffset = $container.scrollTop + visibleHeight;
  //   console.log(scrollOffset);
  if (containerHeight - newMessageHeight <= scrollOffset) {
    $container.scrollTop = $container.scrollHeight;
  }
};

// console.log(message, room);
const socket = io();
socket.on("message", (message) => {
  //   console.log(message);
  const html = Mustache.render($messageTemplate, {
    message: message.text,
    createdAt: moment(message.createdAt).format("hh:mm a"),
    username: message.username,
  });
  $container.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (url) => {
  //   console.log(url);
  const html = Mustache.render($locationTemplate, {
    url: url.url,
    createdAt: moment(url.createdAt).format("hh:mm a"),
    username: url.username,
  });
  $container.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render($sidebarTemplate, { room, users });
  //   console.log(html);

  //   document.querySelector("#sidebar").insertAdjacentHTML("beforeend", html);
  document.querySelector("#sidebar").innerHTML = html;
  //   console.log(document.querySelector("#sidebar"));
  //   console.log(room);
  //   console.log(users);
});

$messageForm.addEventListener("submit", (e) => {
  e.preventDefault();
  $messageFormButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  socket.emit("sendMessage", message, (msg) => {
    $messageFormButton.removeAttribute("disabled");
    $messageFormInput.value = "";
    $messageFormInput.focus();
    // console.log(msg);
  });
});

$sendLocation.addEventListener("click", (e) => {
  $sendLocation.setAttribute("disabled", "disabled");
  if (!navigator.geolocation.getCurrentPosition) {
    return alert("Geolocation not supported");
  }
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    // console.log(lat, lon);
    const crds = { lat, lon };
    socket.emit("sendLocation", crds, (msg) => {
      $sendLocation.removeAttribute("disabled");
      //   console.log(msg);
    });
  });
});

socket.emit("join", { message, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
// console.log("hello");
// socket.on("countUpdated", (count) => {
//   console.log("Count:", count);
// });

// document.querySelector("#increment").addEventListener("click", () => {
//   socket.emit("increment");
//   //   console.log("count:", count);
// });
