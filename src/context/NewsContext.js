import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { analyticsService } from '../services/analyticsService';

const NewsContext = createContext();

export const useNews = () => {
  const context = useContext(NewsContext);
  if (!context) {
    throw new Error('useNews must be used within a NewsProvider');
  }
  return context;
};

export const NewsProvider = ({ children }) => {
  const [news, setNews] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [filters, setFilters] = useState({
    city: '',
    topic: ''
  });

  // Load data from storage on app start
  useEffect(() => {
    loadData();
  }, []);

  // Save data to storage whenever it changes
  useEffect(() => {
    saveData();
  }, [news, bookmarks]);

  const loadData = async () => {
    try {
      const savedNews = await AsyncStorage.getItem('news');
      const savedBookmarks = await AsyncStorage.getItem('bookmarks');
      
      if (savedNews) {
        setNews(JSON.parse(savedNews));
      } else {
        // Add sample data for testing
        const sampleNews = [
          {
            id: '1',
            editedTitle: 'Local Community Festival Draws Hundreds',
            editedSummary: 'The annual community festival in downtown attracted over 500 attendees this weekend. The event featured local musicians, food vendors, and family activities.',
            city: 'Mumbai',
            topic: 'Festival',
            publisherFirstName: 'John',
            publisherPhone: '9876543210',
            timestamp: Date.now() - 86400000, // 1 day ago
          },
          {
            id: '2',
            editedTitle: 'Major Traffic Accident on Main Street',
            editedSummary: 'A serious traffic accident occurred on Main Street this morning, causing delays for commuters. Emergency services responded quickly.',
            city: 'Delhi',
            topic: 'Accident',
            publisherFirstName: 'Sarah',
            publisherPhone: '9876543211',
            timestamp: Date.now() - 172800000, // 2 days ago
          },
          {
            id: '3',
            editedTitle: 'New Community Center Opens',
            editedSummary: 'The new community center officially opened its doors today, providing a space for local events and activities.',
            city: 'Mumbai',
            topic: 'Community Event',
            publisherFirstName: 'Mike',
            publisherPhone: '9876543212',
            timestamp: Date.now() - 259200000, // 3 days ago
          },
          {
            id: '4',
            editedTitle: 'Local Restaurant Wins Award',
            editedSummary: 'A popular local restaurant has won the Best Local Cuisine award for the third year in a row.',
            city: 'Delhi',
            topic: 'Local News',
            publisherFirstName: 'Lisa',
            publisherPhone: '9876543213',
            timestamp: Date.now() - 345600000, // 4 days ago
          }
        ];
        setNews(sampleNews);
        // Initialize analytics with sample data
        sampleNews.forEach(newsItem => {
          analyticsService.trackNewsSubmission(newsItem);
        });
      }
      if (savedBookmarks) {
        setBookmarks(JSON.parse(savedBookmarks));
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = async () => {
    try {
      await AsyncStorage.setItem('news', JSON.stringify(news));
      await AsyncStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  const addNews = (newsItem) => {
    setNews(prevNews => [newsItem, ...prevNews]);
    // Track analytics
    analyticsService.trackNewsSubmission(newsItem);
  };

  const toggleBookmark = (newsId) => {
    setBookmarks(prevBookmarks => {
      const isBookmarked = prevBookmarks.includes(newsId);
      if (isBookmarked) {
        return prevBookmarks.filter(id => id !== newsId);
      } else {
        return [...prevBookmarks, newsId];
      }
    });
  };

  const updateFilters = (newFilters) => {
    setFilters(newFilters);
  };

  const getFilteredNews = (searchQuery = '') => {
    let filteredNews = news;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filteredNews = filteredNews.filter(item => 
        (item.editedTitle || item.title || '').toLowerCase().includes(query) ||
        (item.editedSummary || item.summary || item.description || '').toLowerCase().includes(query) ||
        (item.city || '').toLowerCase().includes(query) ||
        (item.topic || '').toLowerCase().includes(query) ||
        (item.publisherFirstName || item.publisherName || '').toLowerCase().includes(query)
      );
    }

    // Apply city filter
    if (filters.city) {
      filteredNews = filteredNews.filter(item => 
        (item.city || '').toLowerCase() === filters.city.toLowerCase()
      );
    }

    // Apply topic filter
    if (filters.topic) {
      filteredNews = filteredNews.filter(item => 
        (item.topic || '').toLowerCase() === filters.topic.toLowerCase()
      );
    }

    return filteredNews;
  };

  const getBookmarkedNews = () => {
    return news.filter(item => bookmarks.includes(item.id));
  };

  const getAnalytics = () => {
    return analyticsService.getAllStats();
  };

  const getTotalAnalytics = () => {
    const totalNews = news.length;
    const totalBookmarks = bookmarks.length;
    
    // Calculate cities and topics
    const cities = [...new Set(news.map(item => item.city))];
    const topics = [...new Set(news.map(item => item.topic))];
    
    // Calculate news by city
    const newsByCity = {};
    news.forEach(item => {
      newsByCity[item.city] = (newsByCity[item.city] || 0) + 1;
    });
    
    // Calculate news by topic
    const newsByTopic = {};
    news.forEach(item => {
      newsByTopic[item.topic] = (newsByTopic[item.topic] || 0) + 1;
    });

    return {
      totalNews,
      totalBookmarks,
      totalCities: cities.length,
      totalTopics: topics.length,
      newsByCity,
      newsByTopic,
    };
  };

  const reinitializeAnalytics = () => {
    // Reset analytics service
    analyticsService.reset();
    // Re-track all existing news items
    news.forEach(newsItem => {
      analyticsService.trackNewsSubmission(newsItem);
    });
  };

  const value = {
    news,
    bookmarks,
    filters,
    addNews,
    toggleBookmark,
    updateFilters,
    getFilteredNews,
    getBookmarkedNews,
    getAnalytics,
    getTotalAnalytics,
    reinitializeAnalytics,
  };

  return (
    <NewsContext.Provider value={value}>
      {children}
    </NewsContext.Provider>
  );
}; 