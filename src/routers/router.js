const MainController = require("../controllers/mainController");
const mainController = new MainController();

const UsersList = require("../services/DBService").UsersList;
let usersList = new UsersList();

async function router(bot, msg) {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  const text = msg.text;

  if (!text) {
    return;
  }

  if (text.startsWith("/start")) {
    await mainController.start(bot, chatId, msg);
    return;
  } else if (text.startsWith("/help")) {
    await mainController.help(bot, chatId);
    return;
  } else if (text.startsWith("/income")) {
    await mainController.income(bot, chatId, msg);
    return;
  } else {
    await mainController.default(bot, chatId);
    return;
  }
}

module.exports = router;
