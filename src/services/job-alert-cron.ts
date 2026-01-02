// job-matcher/src/services/job-alert-cron.ts
import { CronJob } from "cron";
import { createClient } from "@supabase/supabase-js";
import { TelegramNotifier } from "./telegram-notifier";

// Adzuna API configuration
const ADZUNA_CONFIG = {
  appId: process.env.ADZUNA_APP_ID!,
  appKey: process.env.ADZUNA_APP_KEY!,
  country: "gb",
};

// Telegram bot configuration
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

export interface Alert {
  id: string;
  user_id: string;
  name: string;
  job_title: string;
  location?: string;
  is_remote: boolean;
  skills: string[];
  frequency: "daily" | "weekly";
  telegram_target?: string;
  is_active: boolean;
  last_sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AdzunaJob {
  id: string;
  title: string;
  description: string;
  company: {
    display_name?: string;
    label?: string;
  };
  location: {
    display_name?: string;
    area?: string[];
  };
  redirect_url: string;
  salary_min?: number;
  salary_max?: number;
  salary_is_predicted?: boolean;
  created: string;
  contract_type?: string;
  category: {
    label?: string;
    tag?: string;
  };
}

export class JobAlertCronService {
  public supabase;
  private telegramNotifier;
  private dailyJob: CronJob;
  private weeklyJob: CronJob;

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    this.telegramNotifier = new TelegramNotifier(TELEGRAM_BOT_TOKEN);

    // Schedule daily job (9 AM every day)
    this.dailyJob = new CronJob(
      "0 9 * * *", // 9:00 AM daily
      () => this.processAlerts("daily"),
      null,
      true,
      "Europe/London"
    );

    // Schedule weekly job (Monday 9 AM)
    this.weeklyJob = new CronJob(
      "0 9 * * 1", // 9:00 AM every Monday
      () => this.processAlerts("weekly"),
      null,
      true,
      "Europe/London"
    );
  }

  start() {
    console.log("Job Alert Cron Service started");
    this.dailyJob.start();
    this.weeklyJob.start();
  }

  stop() {
    this.dailyJob.stop();
    this.weeklyJob.stop();
    console.log("Job Alert Cron Service stopped");
  }

  private async processAlerts(frequency: "daily" | "weekly") {
    console.log(`Processing ${frequency} job alerts...`);

    try {
      // Get active alerts for this frequency
      const { data: alerts, error } = await this.supabase
        .from("job_alerts")
        .select("*")
        .eq("is_active", true)
        .eq("frequency", frequency)
        .not("telegram_target", "is", null);

      if (error) {
        console.error("Error fetching alerts:", error);
        return;
      }

      console.log(
        `Found ${alerts?.length || 0} ${frequency} alerts to process`
      );

      // Process each alert
      for (const alert of alerts || []) {
        await this.processSingleAlert(alert as Alert);
      }

      console.log(`Finished processing ${frequency} alerts`);
    } catch (error) {
      console.error("Error processing alerts:", error);
    }
  }

  private async processSingleAlert(alert: Alert) {
    try {
      console.log(`Processing alert: ${alert.name} (${alert.id})`);

      // Fetch new jobs based on alert criteria
      const jobs = await this.fetchJobsForAlert(alert);

      console.log(`Found ${jobs.length} jobs for alert: ${alert.name}`);

      if (jobs.length > 0 && alert.telegram_target) {
        // Calculate match scores for jobs
        const jobsWithScores = this.calculateJobScores(jobs, alert);

        // Send Telegram notification
        const success = await this.telegramNotifier.sendJobAlert(
          alert.telegram_target,
          alert.name,
          jobsWithScores.slice(0, 5) // Send top 5 jobs
        );

        if (success) {
          console.log(`✅ Notification sent for alert: ${alert.name}`);

          // Update last_sent_at
          await this.supabase
            .from("job_alerts")
            .update({
              last_sent_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            })
            .eq("id", alert.id);
        } else {
          console.error(`❌ Failed to send notification for alert: ${alert.name}`);
        }
      } else {
        if (jobs.length === 0) {
          console.log(`No new jobs found for alert: ${alert.name}`);
        } else {
          console.log(`No Telegram target for alert: ${alert.name}`);
        }
      }
    } catch (error) {
      console.error(`Error processing alert ${alert.id}:`, error);
    }
  }

  private async fetchJobsForAlert(alert: Alert): Promise<AdzunaJob[]> {
    try {
      const searchQuery = this.buildSearchQuery(alert);

      // Build base URL
      let url =
        `https://api.adzuna.com/v1/api/jobs/${ADZUNA_CONFIG.country}/search/1?` +
        `app_id=${ADZUNA_CONFIG.appId}&` +
        `app_key=${ADZUNA_CONFIG.appKey}&` +
        `results_per_page=20&` +
        `what=${encodeURIComponent(searchQuery)}&` +
        `max_days_old=1&` + // Only jobs posted in the last 24 hours
        `sort_by=date`;

      // Add location filter if specified
      if (alert.location) {
        url += `&where=${encodeURIComponent(alert.location)}`;
      }

      // Add remote filter if specified
      if (alert.is_remote) {
        url += `&remote=true`;
      }

      console.log(`Fetching jobs from Adzuna API: ${url}`);

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Adzuna API error:", response.status, errorText);
        return [];
      }

      const data = await response.json() as { results?: AdzunaJob[] };
      return data.results || [];
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }

  private buildSearchQuery(alert: Alert): string {
    let query = alert.job_title;

    if (alert.skills && alert.skills.length > 0) {
      query += ` ${alert.skills.slice(0, 3).join(" ")}`;
    }

    return query.trim();
  }

  private calculateJobScores(jobs: AdzunaJob[], alert: Alert): any[] {
    const alertSkills = alert.skills.map((skill) => skill.toLowerCase().trim());
    const alertJobTitle = alert.job_title.toLowerCase();

    return jobs
      .map((job) => {
        // Extract job text for matching
        const jobTitle = (job.title || "").toLowerCase();
        const jobDescription = (job.description || "").toLowerCase();
        const jobCategory = (job.category?.label || "").toLowerCase();
        const jobCompany = (job.company?.display_name || "").toLowerCase();

        const jobText = `${jobTitle} ${jobDescription} ${jobCategory} ${jobCompany}`;

        // Count matching skills
        let matchedSkillsCount = 0;
        const matchedSkills: string[] = [];

        for (const skill of alertSkills) {
          if (skill && jobText.includes(skill)) {
            matchedSkillsCount++;
            matchedSkills.push(skill);
          }
        }

        // Calculate score (0-100)
        let score = 0;
        if (alertSkills.length > 0) {
          score = Math.round((matchedSkillsCount / alertSkills.length) * 100);
        }

        // Bonus for exact title match (20 points)
        if (
          jobTitle.includes(alertJobTitle) ||
          alertJobTitle.includes(jobTitle)
        ) {
          score = Math.min(score + 20, 100);
        }

        // Bonus for title keywords match
        const titleWords = alertJobTitle
          .split(/[\s-]+/)
          .filter((word) => word.length > 3);
        let titleMatchCount = 0;
        for (const word of titleWords) {
          if (jobText.includes(word)) {
            titleMatchCount++;
          }
        }

        if (titleWords.length > 0) {
          const titleBonus = Math.round(
            (titleMatchCount / titleWords.length) * 15
          );
          score = Math.min(score + titleBonus, 100);
        }

        // Ensure minimum score for any job
        if (score === 0 && jobs.length > 0) {
          score = 5; // Minimum 5% for any job
        }

        return {
          title: job.title || "No title",
          company: job.company || {},
          location: job.location || {},
          url:
            job.redirect_url ||
            `https://www.adzuna.co.uk/jobs/details/${job.id}`,
          salary_min: job.salary_min,
          salary_max: job.salary_max,
          salary_is_predicted: job.salary_is_predicted,
          created: job.created,
          score: score,
          contract_type: job.contract_type,
          description: job.description || "",
          _matched_skills: matchedSkills,
        };
      })
      .sort((a, b) => b.score - a.score); // Sort by score descending
  }

  async triggerManualAlert(alertId: string): Promise<boolean> {
    try {
      const { data: alert, error } = await this.supabase
        .from("job_alerts")
        .select("*")
        .eq("id", alertId)
        .single();

      if (error) {
        console.error("Error fetching alert:", error);
        return false;
      }

      if (!alert) {
        console.error("Alert not found:", alertId);
        return false;
      }

      console.log(`Manually triggering alert: ${alert.name}`);
      await this.processSingleAlert(alert as Alert);
      return true;
    } catch (error) {
      console.error("Error triggering manual alert:", error);
      return false;
    }
  }
}