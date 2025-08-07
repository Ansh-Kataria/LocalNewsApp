import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';

// Import screens
import NewsSubmissionScreen from './src/screens/NewsSubmissionScreen';
import NewsFeedScreen from './src/screens/NewsFeedScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';

// Import context
import { NewsProvider } from './src/context/NewsContext';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NewsProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
                                <Stack.Navigator
                        initialRouteName="NewsFeed"
                        screenOptions={{
                          headerStyle: {
                            backgroundColor: '#0ea5e9',
                            elevation: 0,
                            shadowOpacity: 0,
                          },
                          headerTintColor: '#fff',
                          headerTitleStyle: {
                            fontWeight: 'bold',
                            fontSize: 18,
                          },
                          headerShadowVisible: false,
                        }}
                      >
            <Stack.Screen 
              name="NewsFeed" 
              component={NewsFeedScreen} 
              options={{ title: 'Local News Feed' }}
            />
            <Stack.Screen 
              name="NewsSubmission" 
              component={NewsSubmissionScreen} 
              options={{ title: 'Submit News' }}
            />
            <Stack.Screen 
              name="Analytics" 
              component={AnalyticsScreen} 
              options={{ title: 'Analytics' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </NewsProvider>
    </PaperProvider>
  );
} 