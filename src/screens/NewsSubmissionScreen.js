import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
  Chip,
} from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useNews } from '../context/NewsContext';
import { validateNewsWithGPT } from '../services/gptService';
import { validatePhoneNumber } from '../utils/phoneMask';

const TOPICS = ['Accident', 'Festival', 'Community Event', 'Local News', 'City Update', 'Town Event'];

export default function NewsSubmissionScreen({ navigation }) {
  const { addNews } = useNews();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    city: '',
    topic: '',
    publisherFirstName: '',
    publisherPhone: '',
    image: null,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'News title is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'News description is required';
    } else if (formData.description.length < 50) {
      newErrors.description = 'Description must be at least 50 characters';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.topic.trim()) {
      newErrors.topic = 'Topic/Category is required';
    }

    if (!formData.publisherFirstName.trim()) {
      newErrors.publisherFirstName = 'Publisher first name is required';
    }

    if (!formData.publisherPhone.trim()) {
      newErrors.publisherPhone = 'Publisher phone number is required';
    } else if (!validatePhoneNumber(formData.publisherPhone)) {
      newErrors.publisherPhone = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          image: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take photos');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setFormData(prev => ({
          ...prev,
          image: result.assets[0].uri,
        }));
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Send to GPT for validation and editing
      const gptResponse = await validateNewsWithGPT(formData);

      if (gptResponse.approved) {
        // Create news item with GPT-edited content
        const newsItem = {
          id: Date.now().toString(),
          originalTitle: formData.title,
          originalDescription: formData.description,
          editedTitle: gptResponse.editedTitle,
          editedSummary: gptResponse.editedSummary,
          city: formData.city,
          topic: formData.topic,
          publisherFirstName: formData.publisherFirstName,
          publisherPhone: formData.publisherPhone,
          image: formData.image,
          timestamp: new Date().toISOString(),
          gptReason: gptResponse.reason,
        };

        addNews(newsItem);
        
        Alert.alert(
          'Success!',
          'Your news has been approved and published!\n\nNote: AI validation is currently using a mock system with limited keyword checking due to OpenAI API unavailability.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('NewsFeed'),
            },
          ]
        );
      } else {
        Alert.alert('News Rejected', gptResponse.reason);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to submit news. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const maskPhoneNumber = (phone) => {
    if (phone.length < 4) return phone;
    return phone.slice(0, 3) + '****' + phone.slice(-3);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>Submit Local News</Title>
            <Paragraph style={styles.subtitle}>
              Share local happenings in your community
            </Paragraph>
            
            <View style={styles.aiInfoCard}>
              <Text style={styles.aiInfoTitle}>🤖 AI Validation Status</Text>
              <Text style={styles.aiInfoText}>
                Currently using mock validation system. The AI checks for:
              </Text>
              <View style={styles.keywordList}>
                <Text style={styles.keywordTitle}>🚫 Spam Keywords:</Text>
                <Text style={styles.keywords}>buy now, click here, free money, lottery, viagra</Text>
                <Text style={styles.keywordTitle}>⚠️ Sensitive Keywords:</Text>
                <Text style={styles.keywords}>violence, hate, discrimination, illegal</Text>
                <Text style={styles.keywordTitle}>✅ Local Keywords:</Text>
                <Text style={styles.keywords}>accident, festival, community event, local, city, town</Text>
              </View>
            </View>

            <TextInput
              label="News Title *"
              value={formData.title}
              onChangeText={(text) => setFormData(prev => ({ ...prev, title: text }))}
              style={styles.input}
              error={!!errors.title}
              disabled={isSubmitting}
            />
            {errors.title && <Text style={styles.errorText}>{errors.title}</Text>}

            <TextInput
              label="News Description * (min 50 characters)"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              style={styles.input}
              multiline
              numberOfLines={4}
              error={!!errors.description}
              disabled={isSubmitting}
            />
            {errors.description && <Text style={styles.errorText}>{errors.description}</Text>}
            <Text style={styles.charCount}>
              {formData.description.length}/50 characters
            </Text>

            <TextInput
              label="City *"
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              style={styles.input}
              error={!!errors.city}
              disabled={isSubmitting}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            <Text style={styles.label}>Topic/Category *</Text>
            <View style={styles.topicContainer}>
              {TOPICS.map((topic) => (
                <Chip
                  key={topic}
                  selected={formData.topic === topic}
                  onPress={() => setFormData(prev => ({ ...prev, topic }))}
                  style={styles.topicChip}
                  disabled={isSubmitting}
                >
                  {topic}
                </Chip>
              ))}
            </View>
            {errors.topic && <Text style={styles.errorText}>{errors.topic}</Text>}

            <TextInput
              label="Publisher First Name *"
              value={formData.publisherFirstName}
              onChangeText={(text) => setFormData(prev => ({ ...prev, publisherFirstName: text }))}
              style={styles.input}
              error={!!errors.publisherFirstName}
              disabled={isSubmitting}
            />
            {errors.publisherFirstName && <Text style={styles.errorText}>{errors.publisherFirstName}</Text>}

            <TextInput
              label="Publisher Phone Number *"
              value={formData.publisherPhone}
              onChangeText={(text) => setFormData(prev => ({ ...prev, publisherPhone: text }))}
              style={styles.input}
              keyboardType="phone-pad"
              error={!!errors.publisherPhone}
              disabled={isSubmitting}
            />
            {errors.publisherPhone && <Text style={styles.errorText}>{errors.publisherPhone}</Text>}

            <Text style={styles.label}>Optional Image</Text>
            <View style={styles.imageButtons}>
              <Button
                mode="outlined"
                onPress={pickImage}
                disabled={isSubmitting}
                style={styles.imageButton}
              >
                Choose from Gallery
              </Button>
              <Button
                mode="outlined"
                onPress={takePhoto}
                disabled={isSubmitting}
                style={styles.imageButton}
              >
                Take Photo
              </Button>
            </View>

            {formData.image && (
              <Text style={styles.imageSelected}>✓ Image selected</Text>
            )}

            <Button
              mode="contained"
              onPress={handleSubmit}
              style={styles.submitButton}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="white" />
              ) : (
                'Submit News'
              )}
            </Button>
          </Card.Content>
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  card: {
    marginBottom: 24,
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
    marginBottom: 24,
    lineHeight: 22,
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
    borderRadius: 8,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    marginTop: 20,
    color: '#1e293b',
  },
  topicContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  topicChip: {
    margin: 4,
    borderRadius: 20,
  },
  charCount: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'right',
    marginBottom: 12,
    fontWeight: '500',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 13,
    marginBottom: 12,
    fontWeight: '500',
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  imageButton: {
    flex: 1,
    marginHorizontal: 6,
    borderRadius: 8,
  },
  imageSelected: {
    color: '#10b981',
    fontSize: 15,
    marginBottom: 20,
    fontWeight: '600',
  },
  submitButton: {
    marginTop: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  aiInfoCard: {
    backgroundColor: '#f0f9ff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#bae6fd',
  },
  aiInfoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0369a1',
    marginBottom: 8,
  },
  aiInfoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  keywordList: {
    marginTop: 8,
  },
  keywordTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
    marginTop: 8,
  },
  keywords: {
    fontSize: 12,
    color: '#64748b',
    fontStyle: 'italic',
    marginBottom: 4,
    lineHeight: 16,
  },
}); 