// job-matcher/src/services/cron-starter.ts
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import { JobAlertCronService } from './job-alert-cron';

console.log('🚀 Starting Job Alert Cron Service...');
console.log('Environment check:');
console.log('- ADZUNA_APP_ID:', process.env.ADZUNA_APP_ID ? '✅ Set' : '❌ Missing');
console.log('- ADZUNA_APP_KEY:', process.env.ADZUNA_APP_KEY ? '✅ Set' : '❌ Missing');
console.log('- TELEGRAM_BOT_TOKEN:', process.env.TELEGRAM_BOT_TOKEN ? '✅ Set' : '❌ Missing');

// Validate required environment variables
if (!process.env.ADZUNA_APP_ID || !process.env.ADZUNA_APP_KEY) {
  console.error('❌ Missing Adzuna API credentials');
  console.error('Please set ADZUNA_APP_ID and ADZUNA_APP_KEY in .env.local');
  process.exit(1);
}

if (!process.env.TELEGRAM_BOT_TOKEN) {
  console.error('❌ Missing Telegram Bot Token');
  console.error('Please set TELEGRAM_BOT_TOKEN in .env.local');
  process.exit(1);
}

const cronService = new JobAlertCronService();

try {
  cronService.start();
  console.log('✅ Job Alert Cron Service started successfully');
  
  // Test connection immediately
  console.log('\n🔧 Running initial connection tests...');
  
  setTimeout(async () => {
    try {
      // Test Supabase connection
      const { data: alerts, error } = await cronService.supabase
        .from("job_alerts")
        .select("count")
        .eq("is_active", true);
        
      if (error) {
        console.error('❌ Supabase connection error:', error.message);
      } else {
        console.log(`✅ Connected to Supabase`);
      }
      
      // Test Telegram bot
      const testUrl = `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/getMe`;
      const telegramTest = await fetch(testUrl);
      
      if (telegramTest.ok) {
        const botInfo = await telegramTest.json();
        console.log(`✅ Telegram bot connected: @${botInfo.result.username}`);
      } else {
        console.error('❌ Telegram bot connection failed');
      }
      
      // Show active alerts count
      const { data: activeAlerts, error: alertsError } = await cronService.supabase
        .from("job_alerts")
        .select("*")
        .eq("is_active", true)
        .not("telegram_target", "is", null);
        
      if (!alertsError && activeAlerts) {
        console.log(`📊 Active alerts with Telegram: ${activeAlerts.length}`);
        
        if (activeAlerts.length > 0) {
          console.log('\n📋 Sample active alerts:');
          activeAlerts.slice(0, 3).forEach((alert, index) => {
            console.log(`${index + 1}. ${alert.name} → ${alert.telegram_target}`);
          });
        }
      }
      
    } catch (testError) {
      console.error('❌ Initial test error:', testError);
    }
    
    console.log('\n⏰ Cron jobs scheduled:');
    console.log('- Daily: 9:00 AM every day');
    console.log('- Weekly: 9:00 AM every Monday');
    console.log('\n✅ System ready! Waiting for scheduled jobs...');
    
  }, 2000);
  
} catch (error) {
  console.error('❌ Failed to start Job Alert Cron Service:', error);
  process.exit(1);
}

// Graceful shutdown
const shutdown = () => {
  console.log('\n🛑 Shutting down Job Alert Cron Service...');
  cronService.stop();
  console.log('✅ Job Alert Cron Service stopped');
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  shutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise);
  console.error('Reason:', reason);
  shutdown();
});