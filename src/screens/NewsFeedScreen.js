import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Button,
  Text,
  Chip,
  FAB,
  Searchbar,
  Menu,
  Divider,
} from 'react-native-paper';
import { useNews } from '../context/NewsContext';
import { maskPhoneNumber } from '../utils/phoneMask';

export default function NewsFeedScreen({ navigation }) {
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
  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [cityFilterVisible, setCityFilterVisible] = useState(false);
  const [topicFilterVisible, setTopicFilterVisible] = useState(false);
  


  const news = showBookmarksOnly ? getBookmarkedNews() : getFilteredNews(searchQuery);
  
  // Debug logging
  console.log('Current filters:', filters);
  console.log('News count:', news.length);
  console.log('Show bookmarks only:', showBookmarksOnly);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };



  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderNewsCard = ({ item }) => {
    const isBookmarked = bookmarks.includes(item.id);

    return (
      <Card style={styles.newsCard} key={item.id}>
        {item.image && (
          <Card.Cover source={{ uri: item.image }} style={styles.cardImage} />
        )}
        <Card.Content>
          <View style={styles.cardHeader}>
            <Title style={styles.newsTitle}>{item.editedTitle}</Title>
            <Button
              icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
              onPress={() => toggleBookmark(item.id)}
              mode="text"
              compact
            />
          </View>
          
          <Paragraph style={styles.newsSummary}>{item.editedSummary}</Paragraph>
          
          <View style={styles.tagsContainer}>
            <Chip style={styles.tag} textStyle={styles.tagText}>
              {item.city}
            </Chip>
            <Chip style={styles.tag} textStyle={styles.tagText}>
              {item.topic}
            </Chip>
          </View>
          
          <View style={styles.cardFooter}>
            <Text style={styles.publisherInfo}>
              By {item.publisherFirstName} • {maskPhoneNumber(item.publisherPhone)}
            </Text>
            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
          </View>
        </Card.Content>
      </Card>
    );
  };

  // Get unique cities and topics from all news data (not filtered)
  const getUniqueCities = () => {
    const cities = [...new Set(allNews.map(item => item.city))];
    return cities.sort();
  };

  const getUniqueTopics = () => {
    const topics = [...new Set(allNews.map(item => item.topic))];
    return topics.sort();
  };

  const FilterMenu = () => (
    <Menu
      visible={filterMenuVisible}
      onDismiss={() => setFilterMenuVisible(false)}
      anchor={<Button mode="text" onPress={() => {}} />}
    >
      <Menu.Item
        onPress={() => {
          setShowBookmarksOnly(!showBookmarksOnly);
          setFilterMenuVisible(false);
        }}
        title={showBookmarksOnly ? 'Show All News' : 'Show Bookmarks Only'}
        leadingIcon={showBookmarksOnly ? 'bookmark-off' : 'bookmark'}
      />
      <Divider />
      <Menu.Item
        onPress={() => {
          setCityFilterVisible(true);
          setFilterMenuVisible(false);
        }}
        title="Filter by City"
        leadingIcon="city"
      />
      <Menu.Item
        onPress={() => {
          setTopicFilterVisible(true);
          setFilterMenuVisible(false);
        }}
        title="Filter by Topic"
        leadingIcon="tag"
      />
      <Divider />
      <Menu.Item
        onPress={() => {
          updateFilters({ city: '', topic: '' });
          setFilterMenuVisible(false);
        }}
        title="Clear All Filters"
        leadingIcon="filter-off"
      />
    </Menu>
  );

  const CityFilterMenu = () => (
    <View style={cityFilterVisible ? styles.dropdownMenu : styles.hidden}>
      <Button
        mode="text"
        onPress={() => {
          updateFilters({ ...filters, city: '' });
          setCityFilterVisible(false);
        }}
        style={styles.dropdownItem}
      >
        All Cities
      </Button>
      {getUniqueCities().map(city => (
        <Button
          key={city}
          mode="text"
          onPress={() => {
            updateFilters({ ...filters, city });
            setCityFilterVisible(false);
          }}
          style={styles.dropdownItem}
        >
          {city}
        </Button>
      ))}
    </View>
  );

  const TopicFilterMenu = () => (
    <View style={topicFilterVisible ? styles.dropdownMenu : styles.hidden}>
      <Button
        mode="text"
        onPress={() => {
          updateFilters({ ...filters, topic: '' });
          setTopicFilterVisible(false);
        }}
        style={styles.dropdownItem}
      >
        All Topics
      </Button>
      {getUniqueTopics().map(topic => (
        <Button
          key={topic}
          mode="text"
          onPress={() => {
            updateFilters({ ...filters, topic });
            setTopicFilterVisible(false);
          }}
          style={styles.dropdownItem}
        >
          {topic}
        </Button>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Searchbar
          placeholder="Search news..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
          iconColor="#64748b"
          placeholderTextColor="#94a3b8"
        />
        <Button
          icon="filter-variant"
          mode="outlined"
          onPress={() => setFilterMenuVisible(true)}
          style={styles.filterButton}
        >
          Filter
        </Button>
        <Button
          icon="chart-line"
          mode="outlined"
          onPress={() => navigation.navigate('Analytics')}
          style={styles.analyticsButton}
        >
          Stats
        </Button>
      </View>

      {/* Quick Filter Buttons */}
      <View style={styles.quickFilters}>
        <Button
          icon="city"
          mode={filters.city ? "contained" : "outlined"}
          onPress={() => setCityFilterVisible(true)}
          style={styles.quickFilterButton}
          compact
        >
          {filters.city || "City"}
        </Button>
        <Button
          icon="tag"
          mode={filters.topic ? "contained" : "outlined"}
          onPress={() => setTopicFilterVisible(true)}
          style={styles.quickFilterButton}
          compact
        >
          {filters.topic || "Topic"}
        </Button>
        <Button
          icon="bookmark"
          mode={showBookmarksOnly ? "contained" : "outlined"}
          onPress={() => setShowBookmarksOnly(!showBookmarksOnly)}
          style={styles.quickFilterButton}
          compact
        >
          Bookmarks
        </Button>
      </View>

      {/* Filter Menus */}
      <FilterMenu />
      <CityFilterMenu />
      <TopicFilterMenu />
      
      {/* Backdrop to close dropdowns */}
      {(cityFilterVisible || topicFilterVisible) && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={() => {
            setCityFilterVisible(false);
            setTopicFilterVisible(false);
          }}
        />
      )}

      {filters.city || filters.topic ? (
        <View style={styles.activeFilters}>
          <Text style={styles.filterLabel}>Active filters:</Text>
          {filters.city && (
            <Chip style={styles.activeFilterChip} onClose={() => updateFilters({ ...filters, city: '' })}>
              City: {filters.city}
            </Chip>
          )}
          {filters.topic && (
            <Chip style={styles.activeFilterChip} onClose={() => updateFilters({ ...filters, topic: '' })}>
              Topic: {filters.topic}
            </Chip>
          )}
        </View>
      ) : null}

      {showBookmarksOnly && (
        <View style={styles.bookmarksHeader}>
          <Text style={styles.bookmarksTitle}>📚 Your Bookmarks</Text>
        </View>
      )}

      {news.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>
            {showBookmarksOnly ? '📚' : '📰'}
          </Text>
          <Text style={styles.emptyStateTitle}>
            {showBookmarksOnly ? 'No bookmarked news yet' : 'No news available'}
          </Text>
          <Text style={styles.emptyStateSubtitle}>
            {showBookmarksOnly 
              ? 'Bookmark news articles to see them here'
              : 'Be the first to submit local news!'
            }
          </Text>
          {!showBookmarksOnly && (
            <Button
              mode="contained"
              onPress={() => navigation.navigate('NewsSubmission')}
              style={styles.submitButton}
              icon="plus"
            >
              Submit News
            </Button>
          )}
        </View>
      ) : (
        <FlatList
          data={news}
          renderItem={renderNewsCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.newsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        />
      )}

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('NewsSubmission')}
        label="Submit News"
        color="white"
        backgroundColor="#0ea5e9"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  searchbar: {
    flex: 1,
    marginRight: 12,
    borderRadius: 12,
    elevation: 0,
  },
  filterButton: {
    minWidth: 80,
    marginRight: 8,
    borderRadius: 8,
  },
  analyticsButton: {
    minWidth: 80,
    borderRadius: 8,
  },
  quickFilters: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  quickFilterButton: {
    marginRight: 10,
    minWidth: 85,
    borderRadius: 20,
    elevation: 0,
  },
  dropdownMenu: {
    position: 'absolute',
    top: 140,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    zIndex: 1000,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  hidden: {
    display: 'none',
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 999,
  },
  activeFilters: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#bae6fd',
  },
  filterLabel: {
    fontSize: 14,
    color: '#0369a1',
    marginRight: 8,
    fontWeight: '600',
  },
  activeFilterChip: {
    marginRight: 8,
    backgroundColor: '#0ea5e9',
  },
  bookmarksHeader: {
    padding: 20,
    backgroundColor: '#fef3c7',
    borderBottomWidth: 1,
    borderBottomColor: '#f59e0b',
  },
  bookmarksTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#92400e',
  },
  newsList: {
    padding: 20,
  },
  newsCard: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardImage: {
    height: 200,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  newsTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e293b',
    lineHeight: 26,
  },
  newsSummary: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    flexWrap: 'wrap',
  },
  tag: {
    marginRight: 8,
    marginBottom: 4,
    backgroundColor: '#dbeafe',
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    color: '#1d4ed8',
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  publisherInfo: {
    fontSize: 13,
    color: '#94a3b8',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#94a3b8',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  fab: {
    position: 'absolute',
    margin: 20,
    right: 0,
    bottom: 0,
    borderRadius: 16,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
}); 