import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { NewsProvider } from './src/context/NewsContext';
import NewsFeedScreen from './src/screens/NewsFeedScreen';
import NewsSubmissionScreen from './src/screens/NewsSubmissionScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

export default function App() {
  const [activeTab, setActiveTab] = useState('feed');

  const renderScreen = () => {
    switch (activeTab) {
      case 'feed':
        return <NewsFeedScreen />;
      case 'submit':
        return <NewsSubmissionScreen />;
      case 'analytics':
        return <AnalyticsScreen />;
      default:
        return <NewsFeedScreen />;
    }
  };

  const TabButton = ({ id, title, icon, isActive, onPress }) => (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.tabIconContainer, isActive && styles.activeTabIconContainer]}>
        <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{icon}</Text>
      </View>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>
        {title}
      </Text>
      {isActive && <View style={styles.activeIndicator} />}
    </TouchableOpacity>
  );

  return (
    <NewsProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#1e293b" />
        
        {/* Main Content */}
        <View style={styles.content}>
          {renderScreen()}
        </View>

        {/* Bottom Tab Navigation */}
        <View style={styles.tabContainer}>
          <View style={styles.tabBackground} />
          
          <TabButton
            id="feed"
            title="Feed"
            icon="📰"
            isActive={activeTab === 'feed'}
            onPress={() => setActiveTab('feed')}
          />
          
          <TabButton
            id="submit"
            title="Submit"
            icon="✍️"
            isActive={activeTab === 'submit'}
            onPress={() => setActiveTab('submit')}
          />
          
          <TabButton
            id="analytics"
            title="Analytics"
            icon="📊"
            isActive={activeTab === 'analytics'}
            onPress={() => setActiveTab('analytics')}
          />
        </View>
      </SafeAreaView>
    </NewsProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  tabBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'white',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    position: 'relative',
  },
  activeTab: {
    // No additional background, handled by indicator
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  activeTabIconContainer: {
    backgroundColor: '#0ea5e9',
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  tabIcon: {
    fontSize: 20,
  },
  activeTabIcon: {
    fontSize: 20,
  },
  tabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginTop: 2,
  },
  activeTabText: {
    color: '#0ea5e9',
    fontWeight: '700',
  },
  activeIndicator: {
    position: 'absolute',
    top: 0,
    left: '50%',
    marginLeft: -12,
    width: 24,
    height: 3,
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
}); 