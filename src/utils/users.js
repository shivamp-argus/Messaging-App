const users = [];

const addUser = ({ id, message, room }) => {
  //   console.log(message);
  username = message.trim().toLowerCase();
  room = room.trim().toLowerCase();

  if (!username || !room) {
    return {
      error: "Username or room not present",
    };
  }

  const existingUser = users.find((user) => {
    return user.room === room && user.username === username;
  });

  if (existingUser) {
    return {
      error: "Username in use!",
    };
  }

  const user = { id, username, room };
  users.push(user);
  return { user };
};

const removeUser = (id) => {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUserInRoom = (room) => {
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  getUser,
  getUserInRoom,
  removeUser,
};
// addUser({
//   id: 22,
//   username: "Sshivam",
//   room: "WelCOme",
// });
// addUser({
//   id: 32,
//   username: "Manish",
//   room: "WelCOme",
// });
// addUser({
//   id: 45,
//   username: "Suraj",
//   room: "Store",
// });
// // const user = getUser(222);
// const userList = getUserInRoom("welcome");
// console.log(userList);
// // const removed = removeUser(22);

// // const res = addUser({
// //   id: 33,
// //   username: "sshivam",
// //   room: "welcome",
// // });
// // console.log(user);
// console.log(users);
