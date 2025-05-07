/**
 * StyleAPIClient.js
 * 
 * Manages all API communications with the image style transformation services.
 * Responsibilities include:
 * - Sending images to style API endpoints
 * - Polling for job status
 * - Retrieving stylized images
 * - Error handling for API requests
 */

class StyleAPIClient {
  constructor(options = {}) {
    // Configuration options with defaults
    this.options = {
      pollingInterval: 2000,  // Default 2 seconds
      maxRetries: 30,         // Default 30 retries
      defaultStyle: 'pixarStyle',
      ...options
    };
    
    // API Endpoints
    this.endpoints = {
      transform: 'https://cartoonique-api.onrender.com/api/transform',
      status: 'https://cartoonique-api.onrender.com/api/transform/status',
      stats: 'https://cartoonique-api.onrender.com/api/transform/stats'
    };
    
    // Current active jobs
    this.activeJobs = new Map();
    
    // Initialize event listeners
    this.eventListeners = {};
    
    console.log('StyleAPIClient initialized');
  }
  
  /**
   * Send an image to the style transformation API
   * @param {File|Blob} file - The image file to transform
   * @param {Object} options - Style options
   * @returns {Promise} A promise resolving to the job data
   */
  async sendImageForStyleTransformation(file, options = {}) {
    try {
      // Default options
      const requestOptions = {
        style: this.options.defaultStyle,
        format: 'portrait',
        ...options
      };
      
      // Create form data for the request
      const formData = new FormData();
      formData.append('image', file);
      formData.append('style', requestOptions.style);
      formData.append('format', requestOptions.format);
      
      // Add any additional options to the request
      Object.entries(requestOptions).forEach(([key, value]) => {
        if (key !== 'style' && key !== 'format') {
          formData.append(key, value);
        }
      });
      
      console.log(`Sending image to API for ${requestOptions.style} transformation`);
      
      // Make the API request
      const response = await fetch(this.endpoints.transform, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      if (!data.jobId) {
        throw new Error('No job ID returned from the API');
      }
      
      // Store the job in active jobs
      this.activeJobs.set(data.jobId, {
        startTime: new Date(),
        status: 'pending',
        options: requestOptions
      });
      
      console.log('Job submitted successfully:', data.jobId);
      
      // Start polling for job status
      this.pollJobStatus(data.jobId);
      
      // Dispatch job-created event
      this.dispatchEvent('job-created', {
        jobId: data.jobId,
        options: requestOptions
      });
      
      return data;
    } catch (error) {
      console.error('Error sending image to API:', error);
      
      // Dispatch error event
      this.dispatchEvent('error', {
        message: 'Failed to send image for processing',
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Poll for job status from the API
   * @param {string} jobId - The ID of the job to poll
   * @param {number} attempt - The current attempt number (for retries)
   */
  async pollJobStatus(jobId, attempt = 1) {
    // Check if job exists in active jobs
    if (!this.activeJobs.has(jobId)) {
      console.log(`Job ${jobId} not found in active jobs, stopping polling`);
      return;
    }
    
    // Check if we've exceeded max retries
    if (attempt > this.options.maxRetries) {
      console.error(`Max retries (${this.options.maxRetries}) exceeded for job ${jobId}`);
      
      // Update job status
      const job = this.activeJobs.get(jobId);
      job.status = 'failed';
      this.activeJobs.set(jobId, job);
      
      // Dispatch job-failed event
      this.dispatchEvent('job-failed', {
        jobId,
        message: 'Max polling attempts exceeded'
      });
      
      return;
    }
    
    try {
      // Construct the status URL
      const statusUrl = `${this.endpoints.status}/${jobId}`;
      
      console.log(`Polling job status for ${jobId}, attempt ${attempt}`);
      
      // Make the API request
      const response = await fetch(statusUrl);
      
      if (!response.ok) {
        throw new Error(`Status API request failed with status ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      // Update job in active jobs
      const job = this.activeJobs.get(jobId);
      job.status = data.status;
      job.lastPolled = new Date();
      
      if (data.resultUrl) {
        job.resultUrl = data.resultUrl;
      }
      
      this.activeJobs.set(jobId, job);
      
      // Check job status
      if (data.status === 'completed') {
        console.log(`Job ${jobId} completed successfully`);
        
        // Dispatch job-completed event
        this.dispatchEvent('job-completed', {
          jobId,
          resultUrl: data.resultUrl,
          options: job.options
        });
        
        // Clean up this job
        setTimeout(() => {
          this.activeJobs.delete(jobId);
        }, 5000);
        
        return;
      } else if (data.status === 'failed') {
        console.error(`Job ${jobId} failed`, data.error);
        
        // Dispatch job-failed event
        this.dispatchEvent('job-failed', {
          jobId,
          message: data.error || 'Job processing failed',
          options: job.options
        });
        
        // Clean up this job
        setTimeout(() => {
          this.activeJobs.delete(jobId);
        }, 5000);
        
        return;
      }
      
      // Job is still processing, schedule next poll
      setTimeout(() => {
        this.pollJobStatus(jobId, attempt + 1);
      }, this.options.pollingInterval);
    } catch (error) {
      console.error(`Error polling status for job ${jobId}:`, error);
      
      // Schedule retry with exponential backoff
      const backoffDelay = Math.min(
        this.options.pollingInterval * Math.pow(1.5, attempt - 1),
        10000 // Max 10 seconds
      );
      
      console.log(`Retrying in ${backoffDelay}ms`);
      
      setTimeout(() => {
        this.pollJobStatus(jobId, attempt + 1);
      }, backoffDelay);
    }
  }
  
  /**
   * Cancel a job if it's still active
   * @param {string} jobId - The ID of the job to cancel
   */
  cancelJob(jobId) {
    if (this.activeJobs.has(jobId)) {
      console.log(`Cancelling job ${jobId}`);
      
      // Update job status
      const job = this.activeJobs.get(jobId);
      job.status = 'cancelled';
      this.activeJobs.set(jobId, job);
      
      // Dispatch job-cancelled event
      this.dispatchEvent('job-cancelled', { jobId });
      
      // Clean up this job
      setTimeout(() => {
        this.activeJobs.delete(jobId);
      }, 5000);
    }
  }
  
  /**
   * Get status of all active jobs
   * @returns {Array} Array of job status objects
   */
  getActiveJobs() {
    return Array.from(this.activeJobs.entries()).map(([jobId, job]) => ({
      jobId,
      ...job
    }));
  }
  
  /**
   * Clean up stale jobs that have been active for too long
   */
  cleanupStaleJobs() {
    const now = new Date();
    const staleThreshold = 10 * 60 * 1000; // 10 minutes
    
    for (const [jobId, job] of this.activeJobs.entries()) {
      const jobAge = now - job.startTime;
      
      if (jobAge > staleThreshold) {
        console.log(`Cleaning up stale job ${jobId}, age: ${jobAge}ms`);
        this.activeJobs.delete(jobId);
      }
    }
  }
  
  /**
   * Get API stats for monitoring
   * @returns {Promise} A promise resolving to the stats data
   */
  async getAPIStats() {
    try {
      console.log('Fetching API stats');
      
      // Make the API request
      const response = await fetch(this.endpoints.stats);
      
      if (!response.ok) {
        throw new Error(`Stats API request failed with status ${response.status}`);
      }
      
      // Parse the response
      const data = await response.json();
      
      return data;
    } catch (error) {
      console.error('Error fetching API stats:', error);
      throw error;
    }
  }
  
  /**
   * Add an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  addEventListener(event, callback) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }
  
  /**
   * Remove an event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function to remove
   */
  removeEventListener(event, callback) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(
        listener => listener !== callback
      );
    }
  }
  
  /**
   * Dispatch an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  dispatchEvent(event, data) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
    
    // Also dispatch as a DOM CustomEvent
    const customEvent = new CustomEvent(`style-api-${event}`, {
      detail: data,
      bubbles: true
    });
    document.dispatchEvent(customEvent);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StyleAPIClient;
} else {
  window.StyleAPIClient = StyleAPIClient;
} 