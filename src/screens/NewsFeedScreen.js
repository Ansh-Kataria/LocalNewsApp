import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  TextInput,
  Image,
  Dimensions,
} from 'react-native';
import { useNews } from '../context/NewsContext';
import { maskPhoneNumber } from '../utils/phoneMask';

const { width } = Dimensions.get('window');

export default function NewsFeedScreen() {
  const {
    news: allNews,
    getFilteredNews,
    getBookmarkedNews,
    toggleBookmark,
    bookmarks,
    filters,
    updateFilters,
  } = useNews();

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [showCityFilter, setShowCityFilter] = useState(false);
  const [showTopicFilter, setShowTopicFilter] = useState(false);

  const news = showBookmarksOnly ? getBookmarkedNews() : getFilteredNews(searchQuery);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  // Get unique cities and topics from all news
  const getUniqueCities = () => {
    const cities = [...new Set(allNews.map(item => item.city))];
    return cities.sort();
  };

  const getUniqueTopics = () => {
    const topics = [...new Set(allNews.map(item => item.topic))];
    return topics.sort();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getTopicColor = (topic) => {
    const colors = {
      'Accident': '#ef4444',
      'Festival': '#f59e0b',
      'Community Event': '#10b981',
      'Local News': '#3b82f6',
      'City Update': '#8b5cf6',
      'Town Event': '#06b6d4',
    };
    return colors[topic] || '#6b7280';
  };

  const CityFilterDropdown = () => (
    <View style={[styles.filterDropdown, !showCityFilter && styles.hidden]}>
      <Text style={styles.filterDropdownTitle}>Filter by City</Text>
      <TouchableOpacity
        style={styles.filterOption}
        onPress={() => {
          updateFilters({ ...filters, city: '' });
          setShowCityFilter(false);
        }}
      >
        <Text style={styles.filterOptionText}>All Cities</Text>
        {!filters.city && <Text style={styles.filterOptionCheck}>✓</Text>}
      </TouchableOpacity>
      {getUniqueCities().map(city => (
        <TouchableOpacity
          key={city}
          style={styles.filterOption}
          onPress={() => {
            updateFilters({ ...filters, city });
            setShowCityFilter(false);
          }}
        >
          <Text style={styles.filterOptionText}>{city}</Text>
          {filters.city === city && <Text style={styles.filterOptionCheck}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );

  const TopicFilterDropdown = () => (
    <View style={[styles.filterDropdown, !showTopicFilter && styles.hidden]}>
      <Text style={styles.filterDropdownTitle}>Filter by Topic</Text>
      <TouchableOpacity
        style={styles.filterOption}
        onPress={() => {
          updateFilters({ ...filters, topic: '' });
          setShowTopicFilter(false);
        }}
      >
        <Text style={styles.filterOptionText}>All Topics</Text>
        {!filters.topic && <Text style={styles.filterOptionCheck}>✓</Text>}
      </TouchableOpacity>
      {getUniqueTopics().map(topic => (
        <TouchableOpacity
          key={topic}
          style={styles.filterOption}
          onPress={() => {
            updateFilters({ ...filters, topic });
            setShowTopicFilter(false);
          }}
        >
          <View style={styles.filterOptionWithIcon}>
            <View style={[styles.topicDot, { backgroundColor: getTopicColor(topic) }]} />
            <Text style={styles.filterOptionText}>{topic}</Text>
          </View>
          {filters.topic === topic && <Text style={styles.filterOptionCheck}>✓</Text>}
        </TouchableOpacity>
      ))}
    </View>
  );

  const NewsCard = ({ item }) => {
    const isBookmarked = bookmarks.includes(item.id);
    const topicColor = getTopicColor(item.topic || 'Local News');

    return (
      <View style={styles.newsCard}>
        {/* Card Header */}
        <View style={styles.cardHeader}>
          <View style={styles.topicContainer}>
            <View style={[styles.topicDot, { backgroundColor: topicColor }]} />
            <Text style={[styles.topicText, { color: topicColor }]}>{item.topic || 'Local News'}</Text>
          </View>
          <TouchableOpacity
            onPress={() => toggleBookmark(item.id)}
            style={[styles.bookmarkButton, isBookmarked && styles.bookmarkButtonActive]}
            activeOpacity={0.7}
          >
            <Text style={[styles.bookmarkIcon, isBookmarked && styles.bookmarkIconActive]}>
              {isBookmarked ? '❤️' : '🤍'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Image if available */}
        {item.image && (
          <View style={styles.imageContainer}>
            <Image source={{ uri: item.image }} style={styles.cardImage} />
            <View style={styles.imageOverlay} />
          </View>
        )}

        {/* Content */}
        <View style={styles.cardContent}>
          <Text style={styles.newsTitle}>{item.editedTitle || item.title || 'Untitled'}</Text>
          <Text style={styles.newsSummary}>{item.editedSummary || item.summary || item.description || 'No description available'}</Text>
          
          {/* Location and Date */}
          <View style={styles.metaContainer}>
            <View style={styles.locationContainer}>
              <Text style={styles.locationIcon}>📍</Text>
              <Text style={styles.locationText}>{item.city || 'Unknown'}</Text>
            </View>
            <Text style={styles.dateText}>{formatDate(item.timestamp)}</Text>
          </View>
          
          {/* Publisher Info */}
          <View style={styles.publisherContainer}>
            <View style={styles.publisherAvatar}>
              <Text style={styles.publisherInitial}>
                {(item.publisherFirstName || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.publisherInfo}>
              <Text style={styles.publisherName}>By {item.publisherFirstName || 'Unknown'}</Text>
              <Text style={styles.publisherPhone}>
                {item.publisherPhone ? maskPhoneNumber(item.publisherPhone) : 'No contact'}
              </Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  const EmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateIcon}>
        {showBookmarksOnly ? '💔' : '📰'}
      </Text>
      <Text style={styles.emptyStateTitle}>
        {showBookmarksOnly ? 'No bookmarked news yet' : 'No news available'}
      </Text>
      <Text style={styles.emptyStateSubtitle}>
        {showBookmarksOnly 
          ? 'Bookmark articles to save them for later'
          : 'Be the first to submit local news in your area!'
        }
      </Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header with Gradient */}
      <View style={styles.header}>
        <View style={styles.headerGradient}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Local News</Text>
            <Text style={styles.headerSubtitle}>Stay connected with your community</Text>
            
            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <View style={styles.searchInputContainer}>
                <Text style={styles.searchIcon}>🔍</Text>
                <TextInput
                  placeholder="Search news, locations, topics..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  placeholderTextColor="#94a3b8"
                />
                {searchQuery ? (
                  <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Text style={styles.clearIcon}>✕</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
            
            {/* Filter Buttons */}
            <View style={styles.filterRow}>
              <TouchableOpacity
                style={[styles.filterChip, showBookmarksOnly && styles.filterChipActive]}
                onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
                activeOpacity={0.8}
              >
                <Text style={styles.filterChipIcon}>
                  {showBookmarksOnly ? '❤️' : '🔖'}
                </Text>
                <Text style={[styles.filterChipText, showBookmarksOnly && styles.filterChipTextActive]}>
                  {showBookmarksOnly ? 'Saved' : 'All News'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, filters.city && styles.filterChipActive]}
                onPress={() => {
                  setShowTopicFilter(false);
                  setShowCityFilter(!showCityFilter);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.filterChipIcon}>🏙️</Text>
                <Text style={[styles.filterChipText, filters.city && styles.filterChipTextActive]}>
                  {filters.city || 'City'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.filterChip, filters.topic && styles.filterChipActive]}
                onPress={() => {
                  setShowCityFilter(false);
                  setShowTopicFilter(!showTopicFilter);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.filterChipIcon}>🏷️</Text>
                <Text style={[styles.filterChipText, filters.topic && styles.filterChipTextActive]}>
                  {filters.topic || 'Topic'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.filterChip}
                onPress={() => {
                  updateFilters({ city: '', topic: '' });
                  setSearchQuery('');
                  setShowBookmarksOnly(false);
                  setShowCityFilter(false);
                  setShowTopicFilter(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.filterChipIcon}>🔄</Text>
                <Text style={styles.filterChipText}>Reset</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>

      {/* Active Filters Bar */}
      {(filters.city || filters.topic) && (
        <View style={styles.activeFiltersBar}>
          <Text style={styles.activeFiltersTitle}>Active filters:</Text>
          <View style={styles.activeFiltersContainer}>
            {filters.city && (
              <View style={styles.activeFilterTag}>
                <Text style={styles.activeFilterText}>📍 {filters.city}</Text>
                <TouchableOpacity onPress={() => updateFilters({ ...filters, city: '' })}>
                  <Text style={styles.activeFilterRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
            {filters.topic && (
              <View style={styles.activeFilterTag}>
                <View style={[styles.topicDot, { backgroundColor: getTopicColor(filters.topic) }]} />
                <Text style={styles.activeFilterText}>{filters.topic}</Text>
                <TouchableOpacity onPress={() => updateFilters({ ...filters, topic: '' })}>
                  <Text style={styles.activeFilterRemove}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Filter Dropdowns */}
      {(showCityFilter || showTopicFilter) && (
        <View style={styles.dropdownContainer}>
          <CityFilterDropdown />
          <TopicFilterDropdown />
        </View>
      )}

      {/* Backdrop to close dropdowns */}
      {(showCityFilter || showTopicFilter) && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => {
            setShowCityFilter(false);
            setShowTopicFilter(false);
          }}
        />
      )}

      {/* News List */}
      {news.length === 0 ? (
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        >
          <EmptyState />
        </ScrollView>
      ) : (
        <FlatList
          data={news}
          renderItem={({ item }) => <NewsCard item={item} />}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#1e293b',
  },
  headerGradient: {
    backgroundColor: '#1e293b',
    paddingTop: 8,
  },
  headerContent: {
    padding: 20,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#cbd5e1',
    marginBottom: 24,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 12,
    color: '#1e293b',
  },
  clearButton: {
    padding: 4,
  },
  clearIcon: {
    fontSize: 14,
    color: '#94a3b8',
  },
  filterRow: {
    flexDirection: 'row',
    gap: 12,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterChipActive: {
    backgroundColor: 'white',
  },
  filterChipIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  filterChipText: {
    fontSize: 14,
    color: 'white',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#1e293b',
  },
  scrollContent: {
    flexGrow: 1,
  },
  newsList: {
    padding: 16,
    paddingBottom: 32,
  },
  newsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  topicContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topicDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
  },
  bookmarkButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  bookmarkButtonActive: {
    backgroundColor: '#fef2f2',
  },
  bookmarkIcon: {
    fontSize: 16,
  },
  bookmarkIconActive: {
    fontSize: 16,
  },
  imageContainer: {
    position: 'relative',
  },
  cardImage: {
    width: '100%',
    height: 200,
  },
  imageOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    background: 'linear-gradient(transparent, rgba(0,0,0,0.3))',
  },
  cardContent: {
    padding: 16,
  },
  newsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    lineHeight: 26,
    marginBottom: 8,
  },
  newsSummary: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 16,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  locationText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '600',
  },
  dateText: {
    fontSize: 14,
    color: '#94a3b8',
  },
  publisherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  publisherAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0ea5e9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  publisherInitial: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  publisherInfo: {
    flex: 1,
  },
  publisherName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 2,
  },
  publisherPhone: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 280,
  },
  filterDropdown: {
    position: 'absolute',
    top: 10,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    zIndex: 10,
    maxHeight: 300,
  },
  hidden: {
    display: 'none',
  },
  filterDropdownTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  filterOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '600',
  },
  filterOptionCheck: {
    fontSize: 18,
    color: '#10b981',
  },
  filterOptionWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activeFiltersBar: {
    backgroundColor: '#e0f2fe',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    margin: 16,
  },
  activeFiltersTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  activeFiltersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activeFilterTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d1fae5',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  activeFilterText: {
    fontSize: 13,
    color: '#065f46',
    fontWeight: '600',
    marginRight: 8,
  },
  activeFilterRemove: {
    fontSize: 16,
    color: '#065f46',
    fontWeight: 'bold',
  },
  dropdownContainer: {
    position: 'relative',
    zIndex: 5,
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 4,
  },
}); 