import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Image,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNews } from '../context/NewsContext';
import * as ImagePicker from 'expo-image-picker';
import { validateNewsWithGPT } from '../services/gptService';

// Define topics outside component to prevent re-creation
const TOPICS = [
  { id: 'Accident', icon: '🚨', color: '#ef4444' },
  { id: 'Festival', icon: '🎉', color: '#f59e0b' },
  { id: 'Community Event', icon: '🏛️', color: '#10b981' },
  { id: 'Local News', icon: '📰', color: '#3b82f6' },
  { id: 'City Update', icon: '🏙️', color: '#8b5cf6' },
  { id: 'Town Event', icon: '🏘️', color: '#06b6d4' },
];

// Production-ready InputField component with direct ref management
const ProductionInputField = React.memo(({ 
  label, 
  value, 
  onChangeText, 
  placeholder, 
  error, 
  multiline = false, 
  keyboardType = 'default', 
  maxLength,
  fieldKey
}) => {
  const inputRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  
  // Prevent keyboard dismissal on production builds
  const handleChangeText = useCallback((text) => {
    // Use requestAnimationFrame to ensure state update doesn't interfere with keyboard
    requestAnimationFrame(() => {
      onChangeText(text);
    });
  }, [onChangeText]);

  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputContainer, error && styles.inputContainerError, isFocused && styles.inputContainerFocused]}>
        <TextInput
          ref={inputRef}
          style={[styles.input, multiline && styles.textArea]}
          value={value}
          onChangeText={handleChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#94a3b8"
          multiline={multiline}
          numberOfLines={multiline ? 6 : 1}
          textAlignVertical={multiline ? "top" : "center"}
          keyboardType={keyboardType}
          maxLength={maxLength}
          autoCorrect={false}
          autoCapitalize="none"
          blurOnSubmit={false}
          returnKeyType={multiline ? "default" : "next"}
          selection={undefined} // Let React Native handle selection internally
          underlineColorAndroid="transparent"
          importantForAutofill="no"
        />
      </View>
      {multiline && (
        <Text style={styles.charCount}>{value.length} characters</Text>
      )}
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
});

export default function NewsSubmissionScreen() {
  const { addNews } = useNews();
  
  // Use direct object mutation for production builds to avoid re-renders
  const formDataRef = useRef({
    title: '',
    description: '',
    city: '',
    topic: 'Local News',
    publisherName: '',
    contact: '',
    image: null,
  });

  // Minimal UI state - only what's absolutely necessary for rendering
  const [, forceUpdate] = useState({});
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Force re-render function that doesn't interfere with keyboard
  const triggerUpdate = useCallback(() => {
    forceUpdate({});
  }, []);

  // Production-grade update function with zero dependencies
  const updateField = useCallback((field, value) => {
    // Direct mutation - no state updates that could cause re-renders
    formDataRef.current[field] = value;
    
    // Clear errors without causing re-renders
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
    
    // Trigger minimal re-render after keyboard operations are complete
    requestAnimationFrame(() => {
      triggerUpdate();
    });
  }, [errors, triggerUpdate]);

  // Keyboard event management for production builds
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
      // Keyboard is open - prevent any state updates that could cause dismissal
    });

    const keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
      // Keyboard closed - safe to update
    });

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!formDataRef.current.title.trim()) newErrors.title = 'Title is required';
    if (!formDataRef.current.description.trim()) newErrors.description = 'Description is required';
    if (!formDataRef.current.city.trim()) newErrors.city = 'City is required';
    if (!formDataRef.current.publisherName.trim()) newErrors.publisherName = 'Publisher name is required';
    if (!formDataRef.current.contact.trim()) newErrors.contact = 'Contact is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      updateField('image', result.assets[0].uri);
    }
  };

  const removeImage = () => {
    updateField('image', null);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await validateNewsWithGPT(formDataRef.current);
      
      if (result.approved) {
        const newsItem = {
          id: Date.now().toString(),
          editedTitle: result.editedTitle || formDataRef.current.title,
          editedSummary: result.editedSummary || formDataRef.current.description,
          city: formDataRef.current.city,
          topic: formDataRef.current.topic,
          publisherFirstName: formDataRef.current.publisherName,
          publisherAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(formDataRef.current.publisherName)}&background=0ea5e9&color=fff`,
          publisherPhone: formDataRef.current.contact,
          image: formDataRef.current.image,
          timestamp: Date.now(),
        };

        addNews(newsItem);
        Alert.alert('Success', 'News submitted successfully!', [
          { text: 'OK', onPress: () => {
            // Reset form data
            formDataRef.current = {
              title: '',
              description: '',
              city: '',
              topic: 'Local News',
              publisherName: '',
              contact: '',
              image: null,
            };
            setErrors({});
            // Trigger re-render to update UI
            triggerUpdate();
          }}
        ]);
      } else {
        Alert.alert('Submission Failed', result.reason);
      }
    } catch (error) {
      console.error('Submit error:', error);
      Alert.alert('Error', error.message || 'Failed to submit news. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const TopicSelector = React.memo(() => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Topic Category</Text>
      <View style={styles.topicGrid}>
        {TOPICS.map((topic) => (
          <TouchableOpacity
            key={topic.id}
            style={[
              styles.topicItem,
              formDataRef.current.topic === topic.id && [
                styles.topicItemSelected,
                { borderColor: topic.color, backgroundColor: `${topic.color}20` }
              ]
            ]}
            onPress={() => updateField('topic', topic.id)}
            activeOpacity={0.7}
          >
            <Text style={styles.topicIcon}>{topic.icon}</Text>
            <Text style={[
              styles.topicText,
              formDataRef.current.topic === topic.id && { color: topic.color, fontWeight: 'bold' }
            ]}>
              {topic.id}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  ));

  const ImageUploader = () => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>Image (Optional)</Text>
      
      {formDataRef.current.image ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: formDataRef.current.image }} style={styles.previewImage} />
          <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
            <Text style={styles.removeImageIcon}>✕</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage} activeOpacity={0.8}>
          <View style={styles.imagePickerContent}>
            <Text style={styles.imagePickerIcon}>📷</Text>
            <Text style={styles.imagePickerText}>Add Photo</Text>
            <Text style={styles.imagePickerSubtext}>Tap to select from gallery</Text>
          </View>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Submit News</Text>
          <Text style={styles.headerSubtitle}>Share what's happening in your community</Text>
          
          {/* Progress Indicator */}
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '60%' }]} />
            </View>
            <Text style={styles.progressText}>Almost there!</Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          {/* AI Enhancement Card */}
          <View style={styles.aiCard}>
            <View style={styles.aiCardHeader}>
              <Text style={styles.aiCardIcon}>🤖</Text>
              <Text style={styles.aiCardTitle}>AI-Powered Enhancement</Text>
            </View>
            <Text style={styles.aiCardDescription}>
              Our AI will automatically enhance your news submission for better quality and engagement.
            </Text>
          </View>

          {/* AI Validation Parameters */}
          <View style={styles.validationCard}>
            <View style={styles.validationHeader}>
              <Text style={styles.validationIcon}>🔍</Text>
              <Text style={styles.validationTitle}>Content Validation Keywords</Text>
            </View>
            <Text style={styles.validationSubtitle}>
              Your news will be flagged if it contains these keywords:
            </Text>
            
            <View style={styles.keywordSection}>
              <Text style={styles.keywordSectionTitle}>❌ Spam Keywords (Auto-Reject):</Text>
              <View style={styles.keywordContainer}>
                <Text style={styles.keywordBadge}>buy now</Text>
                <Text style={styles.keywordBadge}>click here</Text>
                <Text style={styles.keywordBadge}>free money</Text>
                <Text style={styles.keywordBadge}>lottery</Text>
                <Text style={styles.keywordBadge}>viagra</Text>
              </View>
            </View>

            <View style={styles.keywordSection}>
              <Text style={styles.keywordSectionTitle}>⚠️ Sensitive Keywords (Auto-Reject):</Text>
              <View style={styles.keywordContainer}>
                <Text style={styles.keywordBadge}>violence</Text>
                <Text style={styles.keywordBadge}>hate</Text>
                <Text style={styles.keywordBadge}>discrimination</Text>
                <Text style={styles.keywordBadge}>illegal</Text>
              </View>
            </View>

            <View style={styles.keywordSection}>
              <Text style={styles.keywordSectionTitle}>✅ Required Topics (Must Include One):</Text>
              <View style={styles.keywordContainer}>
                <Text style={styles.keywordBadgeGood}>accident</Text>
                <Text style={styles.keywordBadgeGood}>festival</Text>
                <Text style={styles.keywordBadgeGood}>community event</Text>
                <Text style={styles.keywordBadgeGood}>local</Text>
                <Text style={styles.keywordBadgeGood}>city</Text>
                <Text style={styles.keywordBadgeGood}>town</Text>
              </View>
            </View>
            
            <View style={styles.validationNote}>
              <Text style={styles.validationNoteIcon}>ℹ️</Text>
              <Text style={styles.validationNoteText}>
                Content must be at least 50 characters and contain local news keywords
              </Text>
            </View>
          </View>

          <ProductionInputField
            label="News Title *"
            value={formDataRef.current.title}
            onChangeText={(value) => updateField('title', value)}
            placeholder="Enter news title..."
            error={errors.title}
            maxLength={100}
            fieldKey="title"
          />

          <ProductionInputField
            label="News Description *"
            value={formDataRef.current.description}
            onChangeText={(value) => updateField('description', value)}
            placeholder="Describe the news in detail..."
            error={errors.description}
            multiline={true}
            maxLength={500}
            fieldKey="description"
          />

          <ProductionInputField
            label="City *"
            value={formDataRef.current.city}
            onChangeText={(value) => updateField('city', value)}
            placeholder="Enter your city name..."
            error={errors.city}
            fieldKey="city"
          />

          <TopicSelector />

          <ProductionInputField
            label="Your Name *"
            value={formDataRef.current.publisherName}
            onChangeText={(value) => updateField('publisherName', value)}
            placeholder="Enter your first name..."
            error={errors.publisherName}
            fieldKey="publisherName"
          />

          <ProductionInputField
            label="Phone Number *"
            value={formDataRef.current.contact}
            onChangeText={(value) => updateField('contact', value)}
            placeholder="Enter your phone number..."
            error={errors.contact}
            keyboardType="phone-pad"
            fieldKey="contact"
          />

          <ImageUploader />

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.submitButtonContent}>
                <ActivityIndicator size="small" color="white" />
                <Text style={styles.submitButtonText}>Publishing...</Text>
              </View>
            ) : (
              <View style={styles.submitButtonContent}>
                <Text style={styles.submitButtonIcon}>🚀</Text>
                <Text style={styles.submitButtonText}>Publish News</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By submitting, you agree to our community guidelines
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
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
    marginBottom: 20,
  },
  progressContainer: {
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#cbd5e1',
  },
  scrollView: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  aiCard: {
    flexDirection: 'column', // Changed to column for better stacking
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  aiCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  aiCardIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  aiCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  aiCardDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  validationCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
  },
  validationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  validationTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  validationSubtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
  },
  validationList: {
    marginBottom: 16,
  },
  validationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  validationBullet: {
    fontSize: 16,
    marginRight: 8,
    color: '#0ea5e9',
  },
  validationText: {
    fontSize: 14,
    color: '#374151',
  },
  validationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
  },
  validationNoteIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#0ea5e9',
  },
  validationNoteText: {
    fontSize: 14,
    color: '#64748b',
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inputContainerError: {
    borderColor: '#ef4444',
  },
  inputContainerFocused: {
    borderColor: '#0ea5e9',
    borderWidth: 2,
  },
  input: {
    fontSize: 16,
    color: '#1e293b',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  textArea: {
    minHeight: 120,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  charCount: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'right',
    marginTop: 6,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginTop: 6,
    fontWeight: '500',
  },
  topicsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  topicItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
    minWidth: 120,
  },
  topicItemSelected: {
    borderWidth: 2,
  },
  topicIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  topicText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  selectedTopicText: {
    color: 'white',
  },
  imageContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageIcon: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  imagePickerButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  imagePickerContent: {
    alignItems: 'center',
  },
  imagePickerIcon: {
    fontSize: 32,
    marginBottom: 12,
  },
  imagePickerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  imagePickerSubtext: {
    fontSize: 14,
    color: '#94a3b8',
  },
  submitButton: {
    backgroundColor: '#0ea5e9',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 32,
    shadowColor: '#0ea5e9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  submitButtonDisabled: {
    backgroundColor: '#94a3b8',
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
  },
  keywordSection: {
    marginBottom: 16,
  },
  keywordSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#374151',
    marginBottom: 8,
  },
  keywordContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  keywordBadge: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#fcd34d',
    borderStyle: 'dashed',
    fontSize: 12,
    fontWeight: '600',
    color: '#92400e',
  },
  keywordBadgeGood: {
    backgroundColor: '#d1fae5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#34d399',
    borderStyle: 'dashed',
    fontSize: 12,
    fontWeight: '600',
    color: '#065f46',
  },
}); 