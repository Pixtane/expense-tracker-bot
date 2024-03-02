const UsersList = require("../services/DBService").UsersList;
let usersList = new UsersList();

const helpText = require("../constants/infos/helpText");

module.exports = class MainController {
  async default(bot, chatId) {
    await bot.sendMessage(
      chatId,
      "Sorry, I don't understand you 😢\n\nPlease try /help to see my commands whithin I work with!"
    );
    return;
  }

  async start(bot, chatId, msg) {
    await bot.sendMessage(
      chatId,
      "Hi! Thank you for using our Telegram Bot! To get started use /help"
    );
    await usersList.createUser(msg.chat.id, msg);
    return;
  }

  dayTimeToUnix(duration) {
    // Converts a duration string like 7d, 3w, 2m, 1y to a Unix timestamp
    const regex = /^(\d+)([dwmy])$/; // Regular expression to match the format of the duration string
    const match = duration.match(regex);

    if (!match) {
      throw new Error(
        "Invalid duration format. Please use the format like '10m', '4h', '3d', '2w', '6M', '1y'."
      );
    }

    const amount = parseInt(match[1]);
    const unit = match[2];

    const currentDate = new Date();
    let newUnixTime;

    switch (unit) {
      case "m":
        newUnixTime = amount * 60 * 1000;
        break;
      case "h":
        newUnixTime = amount * 60 * 60 * 1000;
        break;
      case "d":
        newUnixTime = amount * 24 * 60 * 60 * 1000;
        break;
      case "w":
        newUnixTime = amount * 7 * 24 * 60 * 60 * 1000;
        break;
      case "M":
        newUnixTime =
          new Date(
            currentDate.getFullYear(),
            currentDate.getMonth() + amount,
            currentDate.getDate()
          ).getTime() - new Date().getTime();
        break;
      case "y":
        newUnixTime =
          new Date(
            currentDate.getFullYear() + amount,
            currentDate.getMonth(),
            currentDate.getDate()
          ).getTime() - new Date().getTime();
        break;
      default:
        throw new Error(
          "Invalid duration unit. Please use 'm', 'h', 'd', 'w', 'M', or 'y'."
        );
    }

    return newUnixTime;
  }

  async help(bot, chatId) {
    await bot.sendMessage(chatId, helpText, { parse_mode: "MarkdownV2" });
    return;
  }

  async income(bot, chatId, msg) {
    const amount = msg.text.split(" ")[1];
    const description = msg.text.split(" ").slice(2).join(" ");
    let result = await usersList.addIncome(chatId, amount, description, msg);
    if (result) {
      await bot.sendMessage(chatId, `Added income of: ${amount}`);
      await bot.sendMessage(chatId, JSON.stringify(msg));
    }
  }
};
