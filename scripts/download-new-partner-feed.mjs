#!/usr/bin/env node

import { createWriteStream } from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Nieuwe Partner Feed Downloader
 * Feed IDs: 59155, 59157, 65479, 65481
 */
class NewPartnerFeedDownloader {
  static AWIN_API_KEY = 'f9a87f48c21acebcd87fced8bb38eca5';
  static FEED_IDS = '59155,59157,65479,65481';
  static DOWNLOAD_DIR = path.join(__dirname, '../data');
  static OUTPUT_FILE = path.join(this.DOWNLOAD_DIR, 'new-partner-feed.csv');
  
  static FEED_URL = `https://productdata.awin.com/datafeed/download/apikey/${this.AWIN_API_KEY}/language/nl/fid/${this.FEED_IDS}/rid/0/hasEnhancedFeeds/0/columns/aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,merchant_name,merchant_id,category_name,category_id,aw_image_url,currency,store_price,delivery_cost,merchant_deep_link,language,last_updated,display_price,data_feed_id,brand_name,brand_id,colour,product_short_description,specifications,condition,product_model,model_number,dimensions,keywords,promotional_text,product_type,commission_group,merchant_product_category_path,merchant_product_second_category,merchant_product_third_category,rrp_price,saving,savings_percent,base_price,base_price_amount,base_price_text,product_price_old,delivery_restrictions,delivery_weight,warranty,terms_of_contract,delivery_time,in_stock,stock_quantity,valid_from,valid_to,is_for_sale,web_offer,pre_order,stock_status,size_stock_status,size_stock_amount,merchant_thumb_url,large_image,alternate_image,aw_thumb_url,alternate_image_two,alternate_image_three,alternate_image_four,reviews,average_rating,rating,number_available,ean,isbn,upc,mpn,parent_product_id,product_GTIN,basket_link,Fashion%3Asuitable_for,Fashion%3Acategory,Fashion%3Asize,Fashion%3Amaterial,Fashion%3Apattern,Fashion%3Aswatch/format/csv/delimiter/%2C/compression/gzip/adultcontent/1/`;

  /**
   * Download the feed
   */
  static async downloadFeed() {
    console.log('🌐 Starting new partner feed download...');
    console.log(`📦 Feed IDs: ${this.FEED_IDS}`);
    
    try {
      // Create temp file for compressed download
      const tempGzFile = this.OUTPUT_FILE + '.gz';
      
      console.log('📡 Downloading from Awin API...');
      console.log(`🔗 Feed URL: ${this.FEED_URL.substring(0, 100)}...`);
      
      // Download with curl
      const downloadCommand = `curl -L -o "${tempGzFile}" "${this.FEED_URL}"`;
      
      console.log('⬇️  Downloading compressed feed...');
      await execAsync(downloadCommand);
      
      console.log('📦 Decompressing feed...');
      await execAsync(`gunzip -f "${tempGzFile}"`);
      
      // Check file size and show preview
      const { stdout: wcOutput } = await execAsync(`wc -l "${this.OUTPUT_FILE}"`);
      const lineCount = parseInt(wcOutput.split(' ')[0]);
      
      console.log(`\n✅ Download complete!`);
      console.log(`📊 Total lines: ${lineCount.toLocaleString()}`);
      console.log(`📁 File: ${this.OUTPUT_FILE}`);
      
      // Show first few lines to identify merchant
      console.log('\n📋 Preview (first 3 products):');
      const { stdout: headOutput } = await execAsync(`head -n 4 "${this.OUTPUT_FILE}" | tail -n 3`);
      console.log(headOutput);
      
      // Count unique merchants
      console.log('\n🏪 Analyzing merchants...');
      const { stdout: merchantsOutput } = await execAsync(
        `tail -n +2 "${this.OUTPUT_FILE}" | cut -d',' -f9 | sort | uniq -c | sort -rn`
      );
      console.log('Merchant distribution:');
      console.log(merchantsOutput);
      
      return true;
    } catch (error) {
      console.error('❌ Download failed:', error.message);
      if (error.stderr) {
        console.error('Error details:', error.stderr);
      }
      return false;
    }
  }

  /**
   * Main execution
   */
  static async run() {
    console.log('🚀 Shop Like You Give A Damn Feed Downloader');
    console.log('═══════════════════════════════════════════════\n');
    
    const success = await this.downloadFeed();
    
    if (success) {
      console.log('\n✨ Next steps:');
      console.log('1. Review the merchants in the feed');
      console.log('2. Process the CSV with: node scripts/processCsv.mjs');
      console.log('3. Import products to Firebase');
    }
    
    process.exit(success ? 0 : 1);
  }
}

// Run if called directly
NewPartnerFeedDownloader.run().catch(console.error);

export default NewPartnerFeedDownloader;
