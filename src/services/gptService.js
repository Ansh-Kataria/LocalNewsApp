import { OPENAI_CONFIG } from '../config/openai';

// Mock GPT API response for development (fallback)
const MOCK_GPT_RESPONSES = {
  valid: {
    approved: true,
    editedTitle: "Local Community Festival Draws Hundreds",
    editedSummary: "The annual community festival in downtown attracted over 500 attendees this weekend. The event featured local musicians, food vendors, and family activities. Organizers reported record attendance and positive feedback from participants.",
    reason: "News is relevant to local community and contains appropriate content."
  },
  invalid: {
    approved: false,
    reason: "Content appears to be spam or off-topic. Please ensure your news relates to a local happening in your community."
  },
  sensitive: {
    approved: false,
    reason: "Content contains potentially harmful or inappropriate material. Please review and resubmit with appropriate content."
  }
};



const generateEditedTitle = (originalTitle, topic) => {
  const topicPrefixes = {
    'accident': 'Local',
    'festival': 'Community',
    'community event': 'Local',
    'local': 'Local',
    'city': 'City',
    'town': 'Town'
  };

  const prefix = topicPrefixes[topic.toLowerCase()] || 'Local';
  return `${prefix} ${originalTitle}`; 
};

const generateEditedSummary = (description, topic) => {
  // Create a more concise, news-like summary
  const sentences = description.split(/[.!?]+/).filter(s => s.trim().length > 0);
  
  if (sentences.length >= 2) {
    return `${sentences[0].trim()}. ${sentences[1].trim()}.`;
  } else {
    return `${description.trim()}.`;
  }
};

// Mock GPT API implementation (as per assignment requirements)
export const validateNewsWithGPT = async (newsData) => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Mock validation logic based on content
    const { title, description, topic } = newsData;
    
    // Check for spam/off-topic content
    const spamKeywords = ['buy now', 'click here', 'free money', 'lottery', 'viagra'];
    const hasSpamContent = spamKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
    );

    // Check for sensitive content
    const sensitiveKeywords = ['violence', 'hate', 'discrimination', 'illegal'];
    const hasSensitiveContent = sensitiveKeywords.some(keyword => 
      title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword)
    );

    // Check if content is too short or irrelevant
    const isTooShort = description.length < 50;
    const isIrrelevant = !['accident', 'festival', 'community event', 'local', 'city', 'town'].some(keyword => 
      title.toLowerCase().includes(keyword) || description.toLowerCase().includes(keyword) || topic.toLowerCase().includes(keyword)
    );

    if (hasSpamContent) {
      return MOCK_GPT_RESPONSES.invalid;
    }

    if (hasSensitiveContent) {
      return MOCK_GPT_RESPONSES.sensitive;
    }

    if (isTooShort || isIrrelevant) {
      return {
        approved: false,
        reason: "Content is too short or doesn't appear to be relevant local news. Please provide more details about a local happening."
      };
    }

    // Generate edited content for valid submissions
    const editedTitle = generateEditedTitle(title, topic);
    const editedSummary = generateEditedSummary(description, topic);

    return {
      approved: true,
      editedTitle,
      editedSummary,
      reason: "News is relevant to local community and contains appropriate content."
    };

  } catch (error) {
    console.error('GPT validation error:', error);
    throw new Error('Failed to validate news. Please try again later.');
  }
};

// Real OpenAI API implementation (commented out for future use)
/*
export const validateNewsWithGPT = async (newsData) => {
  try {
    // Check if API key is configured
    if (!OPENAI_CONFIG.apiKey || OPENAI_CONFIG.apiKey === 'your-openai-api-key-here') {
      throw new Error('OpenAI API key not configured. Please update src/config/openai.js with your API key.');
    }
    
    // Add a small delay to help with rate limiting
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: `You are a news editor. Analyze the submitted news and:
            1. Check if it's relevant local news (reject spam/off-topic)
            2. Improve the writing into a clean, concise news snippet
            3. Flag sensitive/unsafe content
            4. Return JSON with: approved (boolean), editedTitle, editedSummary, reason`
          },
          {
            role: 'user',
            content: `Title: ${newsData.title}\nDescription: ${newsData.description}\nCity: ${newsData.city}\nTopic: ${newsData.topic}`
          }
        ],
        temperature: OPENAI_CONFIG.temperature,
        max_tokens: OPENAI_CONFIG.maxTokens
      })
    });

    if (!response.ok) {
      if (response.status === 429) {
        // Rate limit exceeded - use fallback mock response
        console.warn('OpenAI API rate limit exceeded. Using fallback response.');
        return {
          approved: true,
          editedTitle: `Local ${newsData.title}`,
          editedSummary: newsData.description,
          reason: "News processed (rate limit fallback)"
        };
      }
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response from OpenAI API');
    }

    const content = data.choices[0].message.content;
    
    try {
      return JSON.parse(content);
    } catch (parseError) {
      // If JSON parsing fails, create a fallback response
      return {
        approved: true,
        editedTitle: `Local ${newsData.title}`,
        editedSummary: newsData.description,
        reason: "News processed by AI editor"
      };
    }
  } catch (error) {
    console.error('OpenAI API error:', error);
    throw new Error('Failed to validate news. Please try again later.');
  }
};
*/