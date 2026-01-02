// job-matcher/telegram-bot/bot.js (UPDATE)
require('dotenv').config({ path: '.env.local' });

const TelegramBot = require('node-telegram-bot-api');
const { createClient } = require('@supabase/supabase-js');

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const bot = new TelegramBot(TOKEN, { polling: true });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name || 'there';
  
  // Cek apakah user sudah ada di database
  try {
    if (username) {
      // Update existing alerts dengan username ini
      const { data: existingAlerts, error } = await supabase
        .from('job_alerts')
        .select('*')
        .eq('telegram_target', username)
        .or(`telegram_target.eq.@${username},telegram_target.eq.${chatId}`);

      if (!error && existingAlerts && existingAlerts.length > 0) {
        // Update alerts dengan chat_id untuk backup
        for (const alert of existingAlerts) {
          await supabase
            .from('job_alerts')
            .update({ 
              telegram_target: username, // Prioritize username
              updated_at: new Date().toISOString()
            })
            .eq('id', alert.id);
        }
      }
    }
  } catch (dbError) {
    console.error('Database error:', dbError);
  }

  const welcomeMessage = `👋 *Hello ${firstName}!*\n\n` +
    `I'm your Job Alert Bot! 🚀\n\n` +
    `I'll send you job notifications based on your criteria.\n\n`;
  
  let message = welcomeMessage;
  
  if (username) {
    message += `✅ *Setup Complete!*\n\n`;
    message += `*Your Telegram username:* @${username}\n`;
    message += `*Your Chat ID:* \`${chatId}\`\n\n`;
    message += `You can now use *@${username}* in your job alert settings.\n\n`;
    message += `*Quick Setup:*\n`;
    message += `1. Go to your job alerts page\n`;
    message += `2. Enter *@${username}* in Telegram field\n`;
    message += `3. Save and test!\n\n`;
  } else {
    message += `*Your Chat ID:* \`${chatId}\`\n\n`;
    message += `*Note:* You don't have a username set.\n`;
    message += `I recommend setting one in Telegram Settings → Username\n\n`;
    message += `For now, you can use your Chat ID: \`${chatId}\``;
  }
  
  message += `\n\n*Available commands:*\n`;
  message += `/setup - Get setup instructions\n`;
  message += `/id - Get your Chat ID/Username\n`;
  message += `/test - Send a test message\n`;
  message += `/help - Show help message`;
  
  // Send welcome sticker
  try {
    await bot.sendSticker(chatId, 'CAACAgIAAxkBAAICo2cWU-VYphPvI1THGlEnfF-SN2WfAAIpAANZuZEj8NR6pzD4GpQ2BA');
  } catch (stickerError) {
    // Continue without sticker if error
  }
  
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
});

bot.onText(/\/setup/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  
  const setupMessage = `🔧 *Setup Instructions*\n\n` +
    `*Option 1: Using Username (Recommended)*\n`;
  
  if (username) {
    await bot.sendMessage(
      chatId,
      `${setupMessage}` +
      `1. Copy your username: *@${username}*\n` +
      `2. Go to job alerts page on website\n` +
      `3. Paste *@${username}* in Telegram field\n` +
      `4. Save and test!\n\n` +
      `*Option 2: Using Chat ID*\n` +
      `Use: \`${chatId}\`\n\n` +
      `*Which to use?*\n` +
      `• Username is easier to remember\n` +
      `• Chat ID works even if username changes\n` +
      `• Both work once you've started me (/start)`,
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📋 Copy Username",
                callback_data: "copy_username"
              },
              {
                text: "📋 Copy Chat ID",
                callback_data: "copy_chatid"
              }
            ],
            [
              {
                text: "🚀 Go to Job Alerts",
                url: "http://localhost:3000/dashboard/alerts" // Update dengan URL Anda
              }
            ]
          ]
        }
      }
    );
  } else {
    await bot.sendMessage(
      chatId,
      `${setupMessage}` +
      `1. Set a username in Telegram Settings first\n` +
      `2. Then use /start to get your username\n\n` +
      `*For now, use Chat ID:*\n` +
      `\`${chatId}\`\n\n` +
      `Copy and paste this in the Telegram field.`,
      { 
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "📋 Copy Chat ID",
                callback_data: "copy_chatid"
              }
            ]
          ]
        }
      }
    );
  }
});

// Handle inline keyboard callbacks
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  const username = callbackQuery.from.username;
  
  if (data === 'copy_username' && username) {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `Username @${username} copied!`
    });
    // Also send as message for easy copy
    await bot.sendMessage(chatId, `@${username}`);
  } else if (data === 'copy_chatid') {
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: `Chat ID ${chatId} copied!`
    });
    await bot.sendMessage(chatId, `${chatId}`);
  }
});

bot.onText(/\/id/, (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  const firstName = msg.from.first_name || 'User';
  
  let message = `👤 *${firstName}'s Telegram Info*\n\n`;
  message += `Chat ID: \`${chatId}\`\n`;
  
  if (username) {
    message += `Username: @${username}\n\n`;
    message += `*Recommended:* Use *@${username}*\n`;
    message += `It's easier to remember!\n\n`;
    message += `*Backup:* Chat ID also works`;
  } else {
    message += `\n*No username set*\n`;
    message += `I recommend setting one:\n`;
    message += `Telegram → Settings → Username\n\n`;
    message += `*For now, use:* \`${chatId}\``;
  }
  
  bot.sendMessage(chatId, message, { 
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🔧 Setup Instructions",
            callback_data: "setup_instructions"
          }
        ]
      ]
    }
  });
});

bot.onText(/\/test/, async (msg) => {
  const chatId = msg.chat.id;
  const username = msg.from.username;
  
  try {
    // Send a test job alert
    const testJobs = [
      {
        title: "Senior Full Stack Developer",
        company: { display_name: "Tech Innovations Inc" },
        location: { display_name: "Remote" },
        url: "https://example.com/jobs/123",
        salary_min: 80000,
        salary_max: 120000,
        created: new Date().toISOString(),
        score: 85
      },
      {
        title: "Frontend React Developer",
        company: "Startup XYZ",
        location: "London, UK",
        url: "https://example.com/jobs/456",
        salary_min: 60000,
        salary_max: 90000,
        created: new Date().toISOString(),
        score: 72
      }
    ];
    
    const testMessage = `✅ *Test Alert Successful!*\n\n` +
      `*Test Job Alert*\n` +
      `Found 2 new jobs!\n\n` +
      `*1. Senior Full Stack Developer*\n` +
      `🏢 Tech Innovations Inc\n` +
      `📍 Remote\n` +
      `💰 £80,000 - £120,000\n` +
      `📅 Today\n` +
      `🎯 Match: 85%\n` +
      `🔗 [Apply Now](https://example.com/jobs/123)\n\n` +
      `*2. Frontend React Developer*\n` +
      `🏢 Startup XYZ\n` +
      `📍 London, UK\n` +
      `💰 £60,000 - £90,000\n` +
      `📅 Today\n` +
      `👍 Match: 72%\n` +
      `🔗 [Apply Now](https://example.com/jobs/456)\n\n` +
      `_✨ This is what real job alerts will look like!_`;
    
    await bot.sendMessage(chatId, testMessage, { 
      parse_mode: 'Markdown',
      disable_web_page_preview: true
    });
    
    console.log(`Test message sent to ${chatId} (${username || 'no username'})`);
  } catch (error) {
    console.error('Error sending test message:', error);
    bot.sendMessage(
      chatId,
      '❌ Failed to send test message. Please try again later.',
      { parse_mode: 'Markdown' }
    );
  }
});

bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `🤖 *Job Alert Bot Help*\n\n` +
    `*What I Do:*\n` +
    `• Send job alerts based on your criteria\n` +
    `• Notify you of new opportunities\n` +
    `• Match jobs to your skills\n\n` +
    `*Setup Process:*\n` +
    `1. Start me (/start)\n` +
    `2. Get your username or Chat ID (/id)\n` +
    `3. Enter it in job alert settings\n` +
    `4. Save and test!\n\n` +
    `*Common Issues:*\n` +
    `• Not receiving alerts? Make sure you've /start ed me\n` +
    `• Wrong username? Use Chat ID instead\n` +
    `• Still issues? Contact support\n\n` +
    `*Commands:*\n` +
    `/start - Start the bot\n` +
    `/setup - Setup guide\n` +
    `/id - Your Telegram info\n` +
    `/test - Test alert\n` +
    `/help - This message`;
  
  bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
});

// Handle all messages
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const username = msg.from.username;
  const firstName = msg.from.first_name || 'Friend';
  
  // Only respond to non-command messages
  if (!text || text.startsWith('/')) {
    return;
  }
  
  // Greeting responses
  const greetings = ['hi', 'hello', 'hey', 'halo', 'hai'];
  const lowerText = text.toLowerCase();
  
  if (greetings.some(greet => lowerText.includes(greet))) {
    const response = `Hello ${firstName}! 👋\n\n` +
      `I'm your Job Alert Bot.\n` +
      `Use /setup to get started or /help for more info.`;
    
    bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    return;
  }
  
  // Default response for other messages
  const defaultResponse = `Hey ${firstName}! 👋\n\n` +
    `I'm here to help with job alerts.\n\n`;
  
  if (username) {
    bot.sendMessage(
      chatId,
      `${defaultResponse}` +
      `Your username is *@${username}*\n` +
      `Use it in your job alert settings!\n\n` +
      `Need help? Try /setup or /help`,
      { parse_mode: 'Markdown' }
    );
  } else {
    bot.sendMessage(
      chatId,
      `${defaultResponse}` +
      `Your Chat ID is: \`${chatId}\`\n` +
      `Use this in your job alert settings.\n\n` +
      `Tip: Set a username in Telegram Settings for easier setup!`,
      { parse_mode: 'Markdown' }
    );
  }
});

console.log('✅ Telegram bot is running...');

// Error handling
bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code, error.message);
});

bot.on('error', (error) => {
  console.error('Bot error:', error);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Stopping Telegram bot...');
  bot.stopPolling();
  console.log('✅ Telegram bot stopped');
  process.exit(0);
});