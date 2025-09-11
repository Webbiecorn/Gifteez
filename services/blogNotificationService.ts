import { BlogPost } from '../types';
import { EmailNotificationService } from './emailNotificationService';
import { NewsletterService } from './newsletterService';

export class BlogNotificationService {
  private static scheduledNotifications = new Map<string, NodeJS.Timeout>();

  static async notifyNewBlogPost(post: BlogPost): Promise<void> {
    try {
      // Get subscribers who want immediate notifications
      const immediateSubscribers = await NewsletterService.getSubscribersByFrequency('immediate');
      
      // Filter by category if subscribers have specific preferences
      const relevantSubscribers = immediateSubscribers.filter(subscriber => 
        subscriber.preferences.categories.length === 0 || 
        subscriber.preferences.categories.includes(post.category)
      );

      if (relevantSubscribers.length > 0) {
        await EmailNotificationService.sendNewBlogPostNotification(post, relevantSubscribers);
        console.log(`Sent immediate notifications to ${relevantSubscribers.length} subscribers for post: ${post.title}`);
      }
    } catch (error) {
      console.error('Error sending immediate blog notifications:', error);
    }
  }

  static async sendDailyDigest(): Promise<void> {
    try {
      const dailySubscribers = await NewsletterService.getSubscribersByFrequency('daily');
      
      if (dailySubscribers.length === 0) {
        console.log('No daily subscribers found');
        return;
      }

      // Get posts from last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      const recentPosts = await this.getRecentPosts(yesterday);
      
      if (recentPosts.length === 0) {
        console.log('No new posts in the last 24 hours');
        return;
      }

      // Group subscribers by category preferences
      const subscribersByCategory = this.groupSubscribersByCategory(dailySubscribers);
      
      for (const [categories, subscribers] of subscribersByCategory) {
        const relevantPosts = this.filterPostsByCategories(recentPosts, categories);
        
        if (relevantPosts.length > 0) {
          const digestTemplate = EmailNotificationService.createWeeklyDigest(relevantPosts);
          
          // Update subject for daily digest
          digestTemplate.subject = `Je dagelijkse cadeau-inspiratie van Gifteez 🎁`;
          
          for (const subscriber of subscribers) {
            await EmailNotificationService.sendEmailToSubscriber(subscriber, digestTemplate);
          }
        }
      }

      console.log(`Sent daily digest to ${dailySubscribers.length} subscribers with ${recentPosts.length} posts`);
    } catch (error) {
      console.error('Error sending daily digest:', error);
    }
  }

  static async sendWeeklyDigest(): Promise<void> {
    try {
      const weeklySubscribers = await NewsletterService.getSubscribersByFrequency('weekly');
      
      if (weeklySubscribers.length === 0) {
        console.log('No weekly subscribers found');
        return;
      }

      // Get posts from last 7 days
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const recentPosts = await this.getRecentPosts(oneWeekAgo);
      
      if (recentPosts.length === 0) {
        console.log('No new posts in the last week');
        return;
      }

      // Group subscribers by category preferences
      const subscribersByCategory = this.groupSubscribersByCategory(weeklySubscribers);
      
      for (const [categories, subscribers] of subscribersByCategory) {
        const relevantPosts = this.filterPostsByCategories(recentPosts, categories);
        
        if (relevantPosts.length > 0) {
          const digestTemplate = EmailNotificationService.createWeeklyDigest(relevantPosts);
          
          for (const subscriber of subscribers) {
            await EmailNotificationService.sendEmailToSubscriber(subscriber, digestTemplate);
          }
        }
      }

      console.log(`Sent weekly digest to ${weeklySubscribers.length} subscribers with ${recentPosts.length} posts`);
    } catch (error) {
      console.error('Error sending weekly digest:', error);
    }
  }

  private static async getRecentPosts(since: Date): Promise<BlogPost[]> {
    // This would typically fetch from your blog data service or database
    // For now, we'll use the imported blog data and filter by date
    try {
      const { blogPosts } = await import('../data/blogData');
      
      return blogPosts.filter(post => 
        new Date(post.publishedDate) >= since
      ).sort((a, b) => 
        new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime()
      );
    } catch (error) {
      console.error('Error fetching recent posts:', error);
      return [];
    }
  }

  private static groupSubscribersByCategory(subscribers: any[]) {
    const groups = new Map<string, any[]>();
    
    for (const subscriber of subscribers) {
      const categoryKey = subscriber.preferences.categories.sort().join(',') || 'all';
      
      if (!groups.has(categoryKey)) {
        groups.set(categoryKey, []);
      }
      groups.get(categoryKey)!.push(subscriber);
    }
    
    return Array.from(groups.entries()).map(([categoryString, subs]) => [
      categoryString === 'all' ? [] : categoryString.split(','),
      subs
    ] as [string[], any[]]);
  }

  private static filterPostsByCategories(posts: BlogPost[], categories: string[]): BlogPost[] {
    if (categories.length === 0) {
      return posts; // No category filter, return all posts
    }
    
    return posts.filter(post => categories.includes(post.category));
  }

  static scheduleNotifications(): void {
    // Schedule daily digest at 9 AM
    this.scheduleDailyTask('daily-digest', '09:00', () => {
      this.sendDailyDigest();
    });

    // Schedule weekly digest on Monday at 9 AM
    this.scheduleWeeklyTask('weekly-digest', 1, '09:00', () => {
      this.sendWeeklyDigest();
    });

    console.log('Email notification schedules configured');
  }

  private static scheduleDailyTask(id: string, time: string, task: () => void): void {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }

    const timeout = scheduledTime.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      task();
      // Schedule for next day
      this.scheduleDailyTask(id, time, task);
    }, timeout);

    this.scheduledNotifications.set(id, timeoutId);
  }

  private static scheduleWeeklyTask(id: string, dayOfWeek: number, time: string, task: () => void): void {
    const [hours, minutes] = time.split(':').map(Number);
    const now = new Date();
    const scheduledTime = new Date();
    
    // Set to the desired day of week and time
    const daysUntilTarget = (dayOfWeek - now.getDay() + 7) % 7;
    scheduledTime.setDate(now.getDate() + daysUntilTarget);
    scheduledTime.setHours(hours, minutes, 0, 0);

    // If the time has passed this week, schedule for next week
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 7);
    }

    const timeout = scheduledTime.getTime() - now.getTime();
    
    const timeoutId = setTimeout(() => {
      task();
      // Schedule for next week
      this.scheduleWeeklyTask(id, dayOfWeek, time, task);
    }, timeout);

    this.scheduledNotifications.set(id, timeoutId);
  }

  static clearSchedules(): void {
    for (const [id, timeoutId] of this.scheduledNotifications) {
      clearTimeout(timeoutId);
    }
    this.scheduledNotifications.clear();
    console.log('All email notification schedules cleared');
  }

  static getScheduleStatus(): Record<string, boolean> {
    return {
      'daily-digest': this.scheduledNotifications.has('daily-digest'),
      'weekly-digest': this.scheduledNotifications.has('weekly-digest')
    };
  }
}

export default BlogNotificationService;
