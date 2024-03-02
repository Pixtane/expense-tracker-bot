const fs = require("fs");
const path = require("path");

const UsersListPath = path.resolve(__dirname, "../config/users_list.json");

class UsersList {
  readUsersFile() {
    try {
      // Read the JSON file and parse its content
      const usersData = fs.readFileSync(UsersListPath, "utf8");
      return JSON.parse(usersData);
    } catch (error) {
      // If the file doesn't exist or is invalid JSON, return an empty object
      return {};
    }
  }

  writeUsersFile(users) {
    // Write the groups object to the JSON file
    fs.writeFileSync(UsersListPath, JSON.stringify(users, null, 2), "utf8");
  }

  createUser(userId, msg) {
    // Load the existing groups from the JSON file
    const users = this.readUsersFile();

    // Check if a group with the given Id already exists
    if (!(userId in users)) {
      const username =
        msg.from.username ||
        msg.from.first_name +
          (msg.from.last_name && msg.from.last_name !== ""
            ? " " + msg.from.last_name
            : "");
      users[userId] = {
        id: userId,
        username: username,
      };

      // Save the updated groups to the JSON file
      this.writeUsersFile(users);

      console.log(`User "${userId}" created successfully.`);
      return 0;
    } else {
      console.log(`User "${userId}" already exists.`);
      return 1;
    }
  }

  getGroupMessages(chatId, startDate = new Date(), endDate = new Date()) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    // Initialize result object
    const result = {};

    // Loop through dates in the range
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dateString = currentDate.toDateString();

      if (thisGroup && thisGroup.messages && thisGroup.messages[dateString]) {
        result[dateString] = thisGroup.messages[dateString];
      }
    }

    return result;
  }

  findUserByUsername(users, username) {
    for (let id in users) {
      if (users[id].username === username) {
        return {
          id: id,
          username: users[id].username,
          first_name: users[id].first_name,
          last_name: users[id].last_name,
          is_bot: users[id].is_bot,
        };
      }
    }
    return null; // Return null if user not found
  }

  getUserByUsername(chatId, username) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    //remove @ from username
    username = username.replace("@", "");

    if (thisGroup && thisGroup.users) {
      let user = this.findUserByUsername(thisGroup.users, username);

      return user;
    }
  }

  addIncome(chatId, amount, description, msg) {
    try {
      const users = this.readUsersFile();
      const thisUser = users[msg.from.id];

      if (thisUser) {
        if (!thisUser.transactions) {
          thisUser.transactions = {};
        }

        thisUser.transactions[msg.message_id] = {
          amount: amount,
          description: description,
        };

        this.writeUsersFile(users);
        return 1;
      }
      return 0;
    } catch (error) {
      console.error(error);
      return 0;
    }
  }

  // To lookup (DO NOT USE)
  addBlockedWord(chatId, blockedWord) {
    // Load the existing groups from the JSON file
    const groups = this.readGroupsFile();
    const thisGroup = groups[chatId];

    if (thisGroup && !thisGroup.rules) {
      thisGroup.rules = {
        bannedWords: [blockedWord],
      };
      this.writeGroupsFile(groups);
    } else if (thisGroup && thisGroup.rules) {
      if (!thisGroup.rules.bannedWords) {
        thisGroup.rules.bannedWords = [];
      }

      if (!thisGroup.rules.bannedWords.includes(blockedWord)) {
        thisGroup.rules.bannedWords.push(blockedWord);
      }
      this.writeGroupsFile(groups);
    }
  }
}

module.exports = {
  UsersList,
};
