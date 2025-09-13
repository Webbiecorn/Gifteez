#!/usr/bin/env node

import { createWriteStream } from 'fs';
import { pipeline } from 'stream/promises';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Automated Feed Downloader for Coolblue Products
 * Downloads and processes the latest product feed from Awin
 */
class FeedDownloader {
  static AWIN_API_KEY = process.env.AWIN_API_KEY || 'YOUR_API_KEY_HERE';
  static FEED_ID = '96636'; // Coolblue feed ID
  static DOWNLOAD_DIR = '/home/kevin/Downloads';
  static TEMP_FILE = `${this.DOWNLOAD_DIR}/datafeed_temp.csv`;
  static FINAL_FILE = `${this.DOWNLOAD_DIR}/datafeed_2566111.csv`;
  
  static FEED_URL = `https://productdata.awin.com/datafeed/download/apikey/${this.AWIN_API_KEY}/language/nl/fid/${this.FEED_ID}/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id,product_short_description,promotional_text/format/csv/delimiter/,/compression/gzip/`;

  /**
   * Download the latest product feed
   */
  static async downloadFeed() {
    console.log('🌐 Starting automated feed download...');
    
    try {
      console.log('📡 Downloading from Awin API...');
      console.log(`Feed URL: ${this.FEED_URL.replace(this.AWIN_API_KEY, '***')}`);
      
      // Download with curl (handles compression automatically)
      const downloadCommand = `curl -L -o "${this.TEMP_FILE}.gz" "${this.FEED_URL}"`;
      
      console.log('⬇️  Downloading compressed feed...');
      await execAsync(downloadCommand);
      
      // Decompress the file
      console.log('📦 Decompressing feed...');
      await execAsync(`gunzip -f "${this.TEMP_FILE}.gz"`);
      
      // Move to final location
      await execAsync(`mv "${this.TEMP_FILE}" "${this.FINAL_FILE}"`);
      
      // Check file size
      const { stdout } = await execAsync(`wc -l "${this.FINAL_FILE}"`);
      const lineCount = parseInt(stdout.split(' ')[0]);
      
      console.log(`✅ Download complete! ${lineCount} lines downloaded`);
      
      return {
        success: true,
        filePath: this.FINAL_FILE,
        lineCount: lineCount - 1 // Subtract header
      };
      
    } catch (error) {
      console.error('❌ Download failed:', error.message);
      
      // Try alternative: direct download without API key (if feed is public)
      console.log('🔄 Trying alternative download method...');
      
      try {
        const alternativeUrl = `https://productdata.awin.com/datafeed/download/apikey/NOKEY/language/nl/fid/${this.FEED_ID}/format/csv/compression/gzip/`;
        const altCommand = `curl -L -o "${this.TEMP_FILE}.gz" "${alternativeUrl}"`;
        
        await execAsync(altCommand);
        await execAsync(`gunzip -f "${this.TEMP_FILE}.gz"`);
        await execAsync(`mv "${this.TEMP_FILE}" "${this.FINAL_FILE}"`);
        
        const { stdout } = await execAsync(`wc -l "${this.FINAL_FILE}"`);
        const lineCount = parseInt(stdout.split(' ')[0]);
        
        console.log(`✅ Alternative download successful! ${lineCount} lines`);
        
        return {
          success: true,
          filePath: this.FINAL_FILE,
          lineCount: lineCount - 1
        };
        
      } catch (altError) {
        console.error('❌ Alternative download also failed:', altError.message);
        
        return {
          success: false,
          error: 'All download methods failed'
        };
      }
    }
  }

  /**
   * Process the downloaded feed
   */
  static async processFeed() {
    console.log('🔄 Processing downloaded feed...');
    
    try {
      // Run the CSV processor
      const processCommand = 'cd "/home/kevin/Gifteez website/gifteez" && node scripts/processCsv.mjs';
      const { stdout, stderr } = await execAsync(processCommand);
      
      console.log('📊 Processing output:');
      console.log(stdout);
      
      if (stderr) {
        console.warn('⚠️  Processing warnings:', stderr);
      }
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Processing failed:', error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Complete automation: download and process
   */
  static async automateUpdate() {
    console.log('🤖 Starting full automation cycle...');
    console.log(`📅 ${new Date().toISOString()}`);
    
    try {
      // Download feed
      const downloadResult = await this.downloadFeed();
      
      if (!downloadResult.success) {
        throw new Error('Download failed: ' + downloadResult.error);
      }
      
      console.log(`📈 Downloaded ${downloadResult.lineCount} products`);
      
      // Process feed
      const processResult = await this.processFeed();
      
      if (!processResult.success) {
        throw new Error('Processing failed: ' + processResult.error);
      }
      
      console.log('🎉 Automation cycle completed successfully!');
      
      // Update timestamp
      const timestamp = new Date().toISOString();
      console.log(`✅ Last updated: ${timestamp}`);
      
      return {
        success: true,
        timestamp,
        productsDownloaded: downloadResult.lineCount
      };
      
    } catch (error) {
      console.error('💥 Automation failed:', error.message);
      
      return {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Schedule automatic updates
   */
  static setupScheduler() {
    console.log('⏰ Setting up automatic scheduler...');
    
    // Run immediately
    this.automateUpdate();
    
    // Schedule daily updates at 3 AM
    const scheduleDaily = () => {
      const now = new Date();
      const next3AM = new Date();
      next3AM.setHours(3, 0, 0, 0);
      
      // If it's already past 3 AM today, schedule for tomorrow
      if (now.getHours() >= 3) {
        next3AM.setDate(next3AM.getDate() + 1);
      }
      
      const msUntil3AM = next3AM.getTime() - now.getTime();
      
      console.log(`⏰ Next update scheduled for: ${next3AM.toISOString()}`);
      
      setTimeout(() => {
        this.automateUpdate().then(() => {
          // Schedule the next day
          scheduleDaily();
        });
      }, msUntil3AM);
    };
    
    scheduleDaily();
  }
}

// Export for use in other modules
export { FeedDownloader };

// Run if called directly
if (import.meta.url === new URL(process.argv[1], 'file://').href) {
  const command = process.argv[2];
  
  switch (command) {
    case 'download':
      FeedDownloader.downloadFeed()
        .then(result => {
          console.log('Download result:', result);
          process.exit(result.success ? 0 : 1);
        });
      break;
      
    case 'process':
      FeedDownloader.processFeed()
        .then(result => {
          console.log('Process result:', result);
          process.exit(result.success ? 0 : 1);
        });
      break;
      
    case 'automate':
      FeedDownloader.automateUpdate()
        .then(result => {
          console.log('Automation result:', result);
          process.exit(result.success ? 0 : 1);
        });
      break;
      
    case 'schedule':
      console.log('🕰️  Starting scheduled automation...');
      FeedDownloader.setupScheduler();
      // Keep process running
      break;
      
    default:
      console.log('📖 Available commands:');
      console.log('  download  - Download latest feed');
      console.log('  process   - Process downloaded feed');
      console.log('  automate  - Download and process (full cycle)');
      console.log('  schedule  - Start scheduled automation');
      break;
  }
}
