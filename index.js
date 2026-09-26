const TelegramBot = require("node-telegram-bot-api");
const express = require("express");

// ===============================
// NOVA MINE BOT
// ===============================

const BOT_TOKEN = process.env.BOT_TOKEN;

if (!BOT_TOKEN) {
  console.error("BOT_TOKEN is missing.");
  process.exit(1);
}

// Telegram bot
const bot = new TelegramBot(BOT_TOKEN, {
  polling: true
});

// Express server for Render
const app = express();

app.get("/", (req, res) => {
  res.send("🚀 NovaMine Bot is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NovaMine server running on port ${PORT}`);
});

// ===============================
// SIMPLE USER STORAGE
// ===============================

const users = new Map();

function getUser(userId, username = "") {
  if (!users.has(userId)) {
    users.set(userId, {
      id: userId,
      username,
      balance: 0,
      referrals: 0,
      mining: false,
      miningStarted: null
    });
  }

  return users.get(userId);
}

// ===============================
// MAIN MENU
// ===============================

function mainMenu() {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "⛏️ Mining", callback_data: "mining" },
          { text: "💰 Balance", callback_data: "balance" }
        ],
        [
          { text: "👥 Referrals", callback_data: "referrals" },
          { text: "⚙️ Settings", callback_data: "settings" }
        ],
        [
          { text: "📢 Announcements", callback_data: "announcements" }
        ]
      ]
    }
  };
}

// ===============================
// /START
// ===============================

bot.onText(/\/start/, (msg) => {
  const userId = msg.from.id;
  const username = msg.from.username || msg.from.first_name || "User";

  const user = getUser(userId, username);

  bot.sendMessage(
    msg.chat.id,
    `🚀 *Welcome to NOVA Mine!*

Hello ${msg.from.first_name || "Miner"} 👋

⛏️ Mine NOVA points
💰 Track your balance
👥 Invite friends
🎁 Earn rewards

Your current balance:

💎 *${user.balance.toFixed(3)} NOVA*

Choose an option below:`,
    {
      parse_mode: "Markdown",
      ...mainMenu()
    }
  );
});

// ===============================
// CALLBACK BUTTONS
// ===============================

bot.on("callback_query", async (query) => {
  const userId = query.from.id;
  const username = query.from.username || query.from.first_name || "User";

  const user = getUser(userId, username);

  await bot.answerCallbackQuery(query.id);

  // -----------------------------
  // MINING
  // -----------------------------

  if (query.data === "mining") {
    if (!user.mining) {
      user.mining = true;
      user.miningStarted = Date.now();

      bot.sendMessage(
        query.message.chat.id,
        `⛏️ *Mining Started!*

🟢 Status: Active
⚡ Mining rate: 0.25 NOVA/hour

Keep the bot active and return later to check your progress.`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💰 Check Balance", callback_data: "balance" }],
              [{ text: "🏠 Home", callback_data: "home" }]
            ]
          }
        }
      );
    } else {
      bot.sendMessage(
        query.message.chat.id,
        `⛏️ *Mining is already active!*

⚡ Rate: 0.25 NOVA/hour`,
        {
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: "💰 Balance", callback_data: "balance" }],
              [{ text: "🏠 Home", callback_data: "home" }]
            ]
          }
        }
      );
    }
  }

  // -----------------------------
  // BALANCE
  // -----------------------------

  if (query.data === "balance") {
    bot.sendMessage(
      query.message.chat.id,
      `💰 *Your NOVA Balance*

💎 Balance: *${user.balance.toFixed(3)} NOVA*

⛏️ Mining: ${user.mining ? "🟢 Active" : "🔴 Inactive"}

👥 Referrals: ${user.referrals}`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "⛏️ Mining", callback_data: "mining" }],
            [{ text: "👥 Referrals", callback_data: "referrals" }],
            [{ text: "🏠 Home", callback_data: "home" }]
          ]
        }
      }
    );
  }

  // -----------------------------
  // REFERRALS
  // -----------------------------

  if (query.data === "referrals") {
    const botUsername = "Novaaminebot";

    const referralLink =
      `https://t.me/${botUsername}?start=ref_${userId}`;

    bot.sendMessage(
      query.message.chat.id,
      `👥 *Referral Program*

Invite your friends and grow the NovaMine community.

🔗 Your referral link:

\`${referralLink}\`

👥 Referrals: *${user.referrals}*`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "📤 Share Link", url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}` }],
            [{ text: "🏠 Home", callback_data: "home" }]
          ]
        }
      }
    );
  }

  // -----------------------------
  // SETTINGS
  // -----------------------------

  if (query.data === "settings") {
    bot.sendMessage(
      query.message.chat.id,
      `⚙️ *NovaMine Settings*

👤 User: ${query.from.first_name || "User"}

🆔 ID: \`${userId}\`

🔔 Notifications: Enabled`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏠 Home", callback_data: "home" }]
          ]
        }
      }
    );
  }

  // -----------------------------
  // ANNOUNCEMENTS
  // -----------------------------

  if (query.data === "announcements") {
    bot.sendMessage(
      query.message.chat.id,
      `📢 *NovaMine Announcements*

🚀 Welcome to NovaMine!

More features will be added as development continues.`,
      {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🏠 Home", callback_data: "home" }]
          ]
        }
      }
    );
  }

  // -----------------------------
  // HOME
  // -----------------------------

  if (query.data === "home") {
    bot.sendMessage(
      query.message.chat.id,
      `🚀 *NovaMine*

Welcome back, ${query.from.first_name || "Miner"}!

Choose an option:`,
      {
        parse_mode: "Markdown",
        ...mainMenu()
      }
    );
  }
});

// ===============================
// ERROR HANDLING
// ===============================

bot.on("polling_error", (error) => {
  console.error("Telegram polling error:", error.message);
});

console.log("🚀 NovaMine Telegram bot started!");
