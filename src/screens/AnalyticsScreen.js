import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { useNews } from '../context/NewsContext';

export default function AnalyticsScreen() {
  const { news, getTotalAnalytics } = useNews();
  const analytics = getTotalAnalytics();

  const StatCard = ({ title, value, subtitle, icon }) => (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
      {subtitle && <Text style={styles.statSubtitle}>{subtitle}</Text>}
    </View>
  );

  const MetricRow = ({ label, value, color = '#64748b' }) => (
    <View style={styles.metricRow}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📊 Analytics Dashboard</Text>
        <Text style={styles.subtitle}>Community news insights</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard
          title="Total News"
          value={analytics.totalNews}
          subtitle="Published articles"
          icon="📰"
        />
        <StatCard
          title="Total Bookmarks"
          value={analytics.totalBookmarks}
          subtitle="Community saves"
          icon="🔖"
        />
        <StatCard
          title="Active Cities"
          value={analytics.totalCities}
          subtitle="Contributing areas"
          icon="🏙️"
        />
        <StatCard
          title="Topics Covered"
          value={analytics.totalTopics}
          subtitle="Different categories"
          icon="🏷️"
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 News by City</Text>
        <View style={styles.metricsContainer}>
          {Object.entries(analytics.newsByCity).map(([city, count]) => (
            <MetricRow key={city} label={city} value={`${count} articles`} />
          ))}
          {Object.keys(analytics.newsByCity).length === 0 && (
            <Text style={styles.emptyText}>No city data available</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🏷️ News by Topic</Text>
        <View style={styles.metricsContainer}>
          {Object.entries(analytics.newsByTopic).map(([topic, count]) => (
            <MetricRow key={topic} label={topic} value={`${count} articles`} color="#0ea5e9" />
          ))}
          {Object.keys(analytics.newsByTopic).length === 0 && (
            <Text style={styles.emptyText}>No topic data available</Text>
          )}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📈 Recent Activity</Text>
        <View style={styles.metricsContainer}>
          <MetricRow 
            label="Last 24 hours" 
            value={`${news.filter(item => {
              const itemDate = new Date(item.timestamp);
              const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
              return itemDate > dayAgo;
            }).length} articles`}
            color="#10b981"
          />
          <MetricRow 
            label="This week" 
            value={`${news.filter(item => {
              const itemDate = new Date(item.timestamp);
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              return itemDate > weekAgo;
            }).length} articles`}
            color="#f59e0b"
          />
          <MetricRow 
            label="This month" 
            value={`${news.filter(item => {
              const itemDate = new Date(item.timestamp);
              const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
              return itemDate > monthAgo;
            }).length} articles`}
            color="#8b5cf6"
          />
        </View>
      </View>

      {news.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateIcon}>📊</Text>
          <Text style={styles.emptyStateTitle}>No Analytics Available</Text>
          <Text style={styles.emptyStateText}>
            Start by submitting some news articles to see analytics data here.
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 20,
    gap: 16,
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '47%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748b',
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    marginTop: 4,
  },
  section: {
    margin: 20,
    marginTop: 0,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  metricsContainer: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  metricLabel: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  metricValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    fontStyle: 'italic',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
}); 