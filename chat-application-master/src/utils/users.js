const users = [];

const addUser = ({ id, username, roomname }) => {
  // Clean the data
  username = username.trim().toLowerCase();
  roomname = roomname.trim().toLowerCase();

  // Validate the data
  if (!username || !roomname) {
    return {
      error: 'Username and roomname are required!'
    };
  }

  // Check for existing user
  const existingUser = users.find(user => {
    return user.roomname === roomname && user.username === username;
  });

  // Validate username
  if (existingUser) {
    return {
      error: 'Username is in use!'
    };
  }

  // Store user
  const user = { id, username, roomname };
  users.push(user);
  return { user };
};

const removeUser = id => {
  const index = users.findIndex(user => user.id === id);

  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
};

const getUser = id => {
  return users.find(user => user.id === id);
};

const getUsersInRoom = roomname => {
  roomname = roomname.trim().toLowerCase();
  return users.filter(user => user.roomname === roomname);
};

module.exports = {
  addUser,
  removeUser,
  getUser,
  getUsersInRoom
};
