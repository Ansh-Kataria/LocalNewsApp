/**
 * Analytics service for tracking news statistics
 * This is a simple implementation for MVP purposes
 */

export class AnalyticsService {
  constructor() {
    this.stats = {
      totalPosts: 0,
      topics: {},
      cities: {},
      publishers: {},
    };
  }

  /**
   * Track a new news submission
   * @param {Object} newsItem - The news item to track
   */
  trackNewsSubmission(newsItem) {
    this.stats.totalPosts++;
    
    // Track topic statistics
    const topic = newsItem.topic.toLowerCase();
    this.stats.topics[topic] = (this.stats.topics[topic] || 0) + 1;
    
    // Track city statistics
    const city = newsItem.city.toLowerCase();
    this.stats.cities[city] = (this.stats.cities[city] || 0) + 1;
    
    // Track publisher statistics
    const publisher = newsItem.publisherFirstName.toLowerCase();
    this.stats.publishers[publisher] = (this.stats.publishers[publisher] || 0) + 1;
  }

  /**
   * Get total post count
   * @returns {number} Total number of posts
   */
  getTotalPosts() {
    return this.stats.totalPosts;
  }

  /**
   * Get top topics
   * @param {number} limit - Number of top topics to return
   * @returns {Array} Array of topic objects with count
   */
  getTopTopics(limit = 5) {
    return Object.entries(this.stats.topics)
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get top cities
   * @param {number} limit - Number of top cities to return
   * @returns {Array} Array of city objects with count
   */
  getTopCities(limit = 5) {
    return Object.entries(this.stats.cities)
      .map(([city, count]) => ({ city, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get top publishers
   * @param {number} limit - Number of top publishers to return
   * @returns {Array} Array of publisher objects with count
   */
  getTopPublishers(limit = 5) {
    return Object.entries(this.stats.publishers)
      .map(([publisher, count]) => ({ publisher, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Get all statistics
   * @returns {Object} Complete statistics object
   */
  getAllStats() {
    return {
      totalPosts: this.getTotalPosts(),
      topTopics: this.getTopTopics(),
      topCities: this.getTopCities(),
      topPublishers: this.getTopPublishers(),
    };
  }

  /**
   * Reset all statistics
   */
  reset() {
    this.stats = {
      totalPosts: 0,
      topics: {},
      cities: {},
      publishers: {},
    };
  }
}

// Create a singleton instance
export const analyticsService = new AnalyticsService(); 