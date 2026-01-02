// job-matcher/src/services/telegram-notifier.ts - FIXED
import axios from "axios";

export interface Job {
  title: string;
  company: { display_name?: string; label?: string } | string;
  location: { display_name?: string; area?: string[] } | string;
  url: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: boolean;
  created?: string;
  score?: number;
  contract_type?: string;
}

export class TelegramNotifier {
  private botToken: string;
  private botUsername: string = "YuanJobMatcher_bot";

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async sendJobAlert(
    telegramTarget: string,
    alertName: string,
    jobs: Job[]
  ): Promise<boolean> {
    try {
      if (!telegramTarget) {
        console.log("No Telegram target provided");
        return false;
      }

      console.log(`Sending job alert "${alertName}" to: ${telegramTarget}`);

      if (jobs.length === 0) {
        const noJobsMessage = this.escapeMarkdownV2(
          `📭 *${alertName}*\n\nNo new job matches found today.`
        );
        return await this.sendMessage(
          telegramTarget,
          noJobsMessage
        );
      }

      const message = this.formatJobAlertMessage(alertName, jobs);
      return await this.sendMessage(telegramTarget, message);
    } catch (error) {
      console.error("Error sending Telegram notification:", error);
      return false;
    }
  }

  async sendMessage(target: string, text: string): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const payload: any = {
        text: text,
        parse_mode: "MarkdownV2",
        disable_web_page_preview: true,
        disable_notification: false,
      };

      // Determine if target is chat_id or username
      if (target.startsWith('@')) {
        payload.chat_id = target;
      } else if (/^\d+$/.test(target)) {
        // Jika target adalah angka (chat_id)
        payload.chat_id = target;
      } else {
        // Jika target adalah username tanpa @
        payload.chat_id = target; // Biarkan tanpa @, Telegram akan handle
      }

      console.log(`Sending Telegram message to: ${payload.chat_id}`);
      
      const response = await axios.post(url, payload, {
        timeout: 10000 // 10 second timeout
      });
      
      if (response.status === 200) {
        console.log(`✅ Telegram message sent successfully`);
        return true;
      } else {
        console.error(`Telegram API returned status: ${response.status}`);
        return false;
      }
    } catch (error: any) {
      const errorData = error.response?.data;
      const errorMessage = errorData || error.message;
      
      console.error("Error sending Telegram message:", errorMessage);
      
      if (errorData) {
        console.error(`❌ Telegram API Error: ${errorData.description}`);
        
        if (errorData.description?.includes('chat not found')) {
          console.error(`User needs to start the bot first`);
        } else if (errorData.description?.includes('bot was blocked')) {
          console.error('User has blocked the bot');
        } else if (errorData.description?.includes('user not found')) {
          console.error('User not found. Check the username');
        } else if (errorData.description?.includes('can\'t parse entities')) {
          console.error('Markdown formatting error. Check for unescaped characters');
          // Coba kirim tanpa markdown
          const plainText = this.removeMarkdownV2(text);
          return await this.sendPlainMessage(target, plainText);
        } else if (errorData.description?.includes('chat_id is empty')) {
          console.error('chat_id is empty. Make sure username is valid');
          // Coba dengan @ di depan jika username
          if (!target.startsWith('@') && !/^\d+$/.test(target)) {
            console.log('Trying with @ prefix');
            return await this.sendMessage(`@${target}`, text);
          }
        }
      }
      
      return false;
    }
  }

  // Send plain text message (no markdown)
  async sendPlainMessage(target: string, text: string): Promise<boolean> {
    try {
      const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
      
      const payload: any = {
        text: text,
        parse_mode: "HTML", // Use HTML instead of markdown
        disable_web_page_preview: true,
      };

      if (target.startsWith('@')) {
        payload.chat_id = target;
      } else if (/^\d+$/.test(target)) {
        payload.chat_id = target;
      } else {
        payload.chat_id = target;
      }

      const response = await axios.post(url, payload, {
        timeout: 10000
      });
      
      return response.status === 200;
    } catch (error) {
      console.error("Error sending plain message:", error);
      return false;
    }
  }

  // Check if a user has started the bot
  async checkUserStatus(usernameOrId: string): Promise<boolean> {
    try {
      const testMessage = this.escapeMarkdownV2(
        `👋 *Connection Test*\n\nThis is a test message to verify that our bot can send you notifications\\.`
      );
      
      const success = await this.sendMessage(usernameOrId, testMessage);
      
      if (success) {
        console.log(`✅ User ${usernameOrId} is reachable`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`Error checking user status for ${usernameOrId}:`, error);
      return false;
    }
  }

  private formatJobAlertMessage(alertName: string, jobs: Job[]): string {
    let message = `🚀 *${this.escapeMarkdownV2(alertName)}*\n`;
    message += `Found ${jobs.length} new job${jobs.length > 1 ? "s" : ""}!\n\n`;

    jobs.forEach((job, index) => {
      const company = this.extractCompanyName(job.company);
      const location = this.extractLocation(job.location);
      const salary = this.formatSalary(job);
      const postedDate = job.created
        ? this.formatDate(job.created)
        : "Recently";

      const score = job.score !== undefined ? `${Math.max(job.score, 5)}%` : "N/A";
      const scoreEmoji = job.score ? this.getScoreEmoji(job.score) : "📝";

      message += `*${index + 1}\\. ${this.escapeMarkdownV2(job.title || "No title")}*\n`;
      message += `🏢 ${this.escapeMarkdownV2(company)}\n`;
      message += `📍 ${this.escapeMarkdownV2(location)}\n`;

      if (salary) {
        message += `💰 ${this.escapeMarkdownV2(salary)}\n`;
      }

      message += `📅 ${this.escapeMarkdownV2(postedDate)}\n`;
      message += `${scoreEmoji} Match: ${this.escapeMarkdownV2(score)}\n`;

      const jobUrl = job.url || "#";
      // Escape tanda kurung di URL untuk MarkdownV2
      const escapedUrl = jobUrl.replace(/\)/g, '\\)');
      message += `🔗 [Apply Now](${escapedUrl})\n\n`;
    });

    message += `_✨ Powered by Job Matcher_\n`;
    message += `_Configure alerts at: your\\-website\\.com/dashboard/alerts_`;
    
    // Telegram has a 4096 character limit, truncate if needed
    if (message.length > 4000) {
      message = message.substring(0, 4000) + "\n\n_[Message truncated due to length]_";
    }
    
    return message;
  }

  // Escape special characters for Telegram MarkdownV2
  private escapeMarkdownV2(text: string): string {
    if (!text) return "";
    
    // Karakter yang perlu di-escape untuk MarkdownV2
    const specialChars = ['_', '*', '[', ']', '(', ')', '~', '`', '>', '#', '+', '-', '=', '|', '{', '}', '.', '!'];
    
    let escapedText = text;
    
    // Escape semua karakter khusus
    specialChars.forEach(char => {
      escapedText = escapedText.split(char).join(`\\${char}`);
    });
    
    return escapedText;
  }

  // Remove markdown formatting for plain text
  private removeMarkdownV2(text: string): string {
    return text
      .replace(/\\([_*[\]()~`>#+=|{}.!-])/g, '$1')  // Hapus escape characters
      .replace(/\*([^*]+)\*/g, '$1')               // Hapus bold
      .replace(/_([^_]+)_/g, '$1')                 // Hapus italic
      .replace(/`([^`]+)`/g, '$1')                 // Hapus code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')     // Hapus links, keep text
      .replace(/\\\\([_*[\]()~`>#+=|{}.!-])/g, '$1'); // Handle double escapes
  }

  private extractCompanyName(company: any): string {
    if (!company) return "Unknown Company";
    if (typeof company === "string") return company;
    return company.display_name || company.label || company.name || "Unknown Company";
  }

  private extractLocation(location: any): string {
    if (!location) return "Remote";
    if (typeof location === "string") return location;
    return location.display_name || 
           (location.area && Array.isArray(location.area) ? location.area.join(", ") : "") || 
           location.name || 
           "Remote";
  }

  private formatSalary(job: Job): string {
    if (!job.salary_min && !job.salary_max) return "";
    
    const min = job.salary_min ? `£${job.salary_min.toLocaleString()}` : "";
    const max = job.salary_max ? `£${job.salary_max.toLocaleString()}` : "";

    if (min && max) return `${min} - ${max}`;
    if (min) return `From ${min}`;
    if (max) return `Up to ${max}`;
    return "Competitive";
  }

  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 3600 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays} days ago`;

      return date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Recently";
    }
  }

  private getScoreEmoji(score: number): string {
    if (score >= 80) return "🎯";
    if (score >= 60) return "👍";
    if (score >= 40) return "🤔";
    return "📝";
  }
}