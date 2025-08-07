import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  Divider,
} from 'react-native-paper';
import { useNews } from '../context/NewsContext';
import { analyticsService } from '../services/analyticsService';

export default function AnalyticsScreen() {
  const { getAnalytics, news, reinitializeAnalytics } = useNews();
  const analytics = getAnalytics();
  const [showDetails, setShowDetails] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  // Auto-reinitialize analytics if empty but news exists
  useEffect(() => {
    if (analytics.totalPosts === 0 && news.length > 0) {
      console.log('Auto-reinitializing analytics from existing news data');
      reinitializeAnalytics();
    }
  }, [analytics.totalPosts, news.length, reinitializeAnalytics]);

  // Debug logging
  console.log('Analytics data:', analytics);
  console.log('News count:', news.length);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.title}>📊 News Analytics</Title>
          <Paragraph style={styles.subtitle}>
            Statistics about news submissions
          </Paragraph>
          <View style={styles.headerActions}>
            <Button
              mode="outlined"
              onPress={() => setShowDetails(!showDetails)}
              style={styles.detailButton}
            >
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            <Button
              mode="outlined"
              onPress={() => {
                reinitializeAnalytics();
                console.log('Analytics reinitialized');
              }}
              style={styles.detailButton}
            >
              Reset
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>📈 Total Posts</Title>
          <Text style={styles.statNumber}>{analytics.totalPosts}</Text>
          <Text style={styles.statLabel}>News articles published</Text>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🏷️ Top Topics</Title>
          {analytics.topTopics.length > 0 ? (
            analytics.topTopics.map((topic, index) => (
              <View key={topic.topic} style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {index + 1}. {topic.topic.charAt(0).toUpperCase() + topic.topic.slice(1)}
                </Text>
                <Text style={styles.statValue}>{topic.count} posts</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No topics yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>🏙️ Top Cities</Title>
          {analytics.topCities.length > 0 ? (
            analytics.topCities.map((city, index) => (
              <View key={city.city} style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {index + 1}. {city.city.charAt(0).toUpperCase() + city.city.slice(1)}
                </Text>
                <Text style={styles.statValue}>{city.count} posts</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No cities yet</Text>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Title style={styles.sectionTitle}>👥 Top Publishers</Title>
          {analytics.topPublishers.length > 0 ? (
            analytics.topPublishers.map((publisher, index) => (
              <View key={publisher.publisher} style={styles.statRow}>
                <Text style={styles.statLabel}>
                  {index + 1}. {publisher.publisher.charAt(0).toUpperCase() + publisher.publisher.slice(1)}
                </Text>
                <Text style={styles.statValue}>{publisher.count} posts</Text>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No publishers yet</Text>
          )}
        </Card.Content>
      </Card>

      {showDetails && (
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>📋 Recent Activity</Title>
            {news.slice(0, 5).map((item, index) => (
              <View key={item.id} style={styles.activityRow}>
                <Text style={styles.activityTitle}>{item.editedTitle}</Text>
                <Text style={styles.activityMeta}>
                  {item.city} • {item.topic} • {item.publisherFirstName}
                </Text>
                <Text style={styles.activityTime}>
                  {new Date(item.timestamp).toLocaleDateString()}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Analytics are updated in real-time as news is submitted
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 20,
  },
  card: {
    marginBottom: 20,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 22,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#1e293b',
  },
  statNumber: {
    fontSize: 56,
    fontWeight: 'bold',
    color: '#0ea5e9',
    textAlign: 'center',
    marginBottom: 12,
  },
  statLabel: {
    fontSize: 15,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  statValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#0ea5e9',
  },
  emptyText: {
    fontSize: 15,
    color: '#94a3b8',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 12,
  },
  detailButton: {
    marginLeft: 10,
    borderRadius: 8,
  },
  activityRow: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#1e293b',
    lineHeight: 22,
  },
  activityMeta: {
    fontSize: 13,
    color: '#64748b',
    marginBottom: 4,
    fontWeight: '500',
  },
  activityTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
}); 