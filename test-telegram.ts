// job-matcher/test-telegram.ts
import { TelegramNotifier } from './src/services/telegram-notifier';

async function testTelegram() {
  console.log('🧪 Testing Telegram Notifier...\n');
  
  if (!process.env.TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is not set in environment');
    process.exit(1);
  }

  const notifier = new TelegramNotifier(process.env.TELEGRAM_BOT_TOKEN);
  
  const testJobs = [
    {
      title: "Senior Frontend Developer",
      company: { display_name: "Tech Corp" },
      location: { display_name: "London, UK" },
      url: "https://example.com/job/123",
      salary_min: 80000,
      salary_max: 100000,
      created: "2024-12-15",
      score: 85,
    },
    {
      title: "React Developer",
      company: "Startup XYZ",
      location: "Remote",
      url: "https://example.com/job/456",
      created: "2024-12-14",
      score: 70,
    },
  ];

  console.log('Test 1: With username');
  const success1 = await notifier.sendJobAlert(
    "your_username_here", // Ganti dengan username Telegram Anda yang sebenarnya
    "Test Job Alert",
    testJobs
  );
  console.log("Result:", success1 ? "✅ Success" : "❌ Failed");

  console.log('\nTest 2: With chat_id');
  const success2 = await notifier.sendJobAlert(
    "123456789", // Ganti dengan chat_id Anda yang sebenarnya
    "Test Job Alert",
    testJobs
  );
  console.log("Result:", success2 ? "✅ Success" : "❌ Failed");

  console.log('\nTest 3: Invalid target');
  const success3 = await notifier.sendJobAlert(
    "invalid",
    "Test Job Alert",
    []
  );
  console.log("Result:", success3 ? "✅ Success" : "❌ Failed (expected)");
}

// Jalankan test
testTelegram().catch(console.error);