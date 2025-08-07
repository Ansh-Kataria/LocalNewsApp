/**
 * Example test cases for the Local News App
 * This file demonstrates how to test the core functionality
 */

// Mock data for testing
const mockNewsData = {
  title: "Local Community Festival",
  description: "The annual community festival in downtown attracted over 500 attendees this weekend. The event featured local musicians, food vendors, and family activities. Organizers reported record attendance and positive feedback from participants.",
  city: "Downtown",
  topic: "Festival",
  publisherFirstName: "John",
  publisherPhone: "9876543210",
  image: null
};

const mockSpamData = {
  title: "Buy now click here",
  description: "This is spam content that should be rejected by the AI validation system.",
  city: "Anywhere",
  topic: "Local News",
  publisherFirstName: "Spammer",
  publisherPhone: "1234567890",
  image: null
};

// Test validation function
function testFormValidation(data) {
  const errors = {};
  
  if (!data.title.trim()) {
    errors.title = 'News title is required';
  }
  
  if (!data.description.trim()) {
    errors.description = 'News description is required';
  } else if (data.description.length < 50) {
    errors.description = 'Description must be at least 50 characters';
  }
  
  if (!data.city.trim()) {
    errors.city = 'City is required';
  }
  
  if (!data.topic.trim()) {
    errors.topic = 'Topic/Category is required';
  }
  
  if (!data.publisherFirstName.trim()) {
    errors.publisherFirstName = 'Publisher first name is required';
  }
  
  if (!data.publisherPhone.trim()) {
    errors.publisherPhone = 'Publisher phone number is required';
  } else if (!/^\d{10}$/.test(data.publisherPhone.replace(/\D/g, ''))) {
    errors.publisherPhone = 'Please enter a valid 10-digit phone number';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Test phone masking function
function testPhoneMasking(phone) {
  if (!phone || phone.length < 4) return phone;
  return phone.slice(0, 3) + '****' + phone.slice(-3);
}

// Test GPT validation (mock)
async function testGPTValidation(newsData) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const { title, description, topic } = newsData;
  
  // Check for spam content
  const spamKeywords = ['buy now', 'click here', 'free money', 'lottery', 'viagra'];
  const hasSpamContent = spamKeywords.some(keyword => 
    title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
  );
  
  if (hasSpamContent) {
    return {
      approved: false,
      reason: "Content appears to be spam or off-topic."
    };
  }
  
  // Check for sensitive content
  const sensitiveKeywords = ['violence', 'hate', 'discrimination', 'illegal'];
  const hasSensitiveContent = sensitiveKeywords.some(keyword => 
    title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
  );
  
  if (hasSensitiveContent) {
    return {
      approved: false,
      reason: "Content contains potentially harmful or inappropriate material."
    };
  }
  
  // Generate edited content
  const editedTitle = `Local ${title}`;
  const editedSummary = description.split('.')[0] + '.';
  
  return {
    approved: true,
    editedTitle,
    editedSummary,
    reason: "News is relevant to local community and contains appropriate content."
  };
}

// Run tests
async function runTests() {
  console.log('🧪 Running Local News App Tests...\n');
  
  // Test 1: Form Validation
  console.log('1. Testing Form Validation:');
  const validationResult = testFormValidation(mockNewsData);
  console.log('   Valid data:', validationResult.isValid);
  console.log('   Errors:', validationResult.errors);
  console.log('');
  
  // Test 2: Phone Masking
  console.log('2. Testing Phone Masking:');
  const maskedPhone = testPhoneMasking(mockNewsData.publisherPhone);
  console.log(`   Original: ${mockNewsData.publisherPhone}`);
  console.log(`   Masked: ${maskedPhone}`);
  console.log('');
  
  // Test 3: GPT Validation - Valid Content
  console.log('3. Testing GPT Validation - Valid Content:');
  const validGPTResult = await testGPTValidation(mockNewsData);
  console.log('   Result:', validGPTResult);
  console.log('');
  
  // Test 4: GPT Validation - Spam Content
  console.log('4. Testing GPT Validation - Spam Content:');
  const spamGPTResult = await testGPTValidation(mockSpamData);
  console.log('   Result:', spamGPTResult);
  console.log('');
  
  console.log('✅ All tests completed!');
}

// Export for use in other files
module.exports = {
  testFormValidation,
  testPhoneMasking,
  testGPTValidation,
  mockNewsData,
  mockSpamData
};

// Run tests if this file is executed directly
if (typeof window === 'undefined') {
  runTests();
} 