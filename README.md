# Local News App - React Native Assignment

A React Native mobile application that allows users to submit local news, which is then analyzed, validated, and refined by AI before being published on a public news feed.

## Features

### Core Features
- **News Submission Screen**: Complete form with all required fields
- **AI Editing & Validation**: GPT-4o-mini integration for content validation and editing
- **News Feed Screen**: Display approved news with filtering and bookmarking
- **Basic Validation**: Form validation with 50-character minimum for descriptions
- **Data Persistence**: Local storage using AsyncStorage

### Additional Features
- **Image Upload**: Optional JPEG/PNG upload from gallery or camera
- **Phone Number Masking**: Displays phone numbers as "987****10"
- **Bookmarking**: Save news articles to local storage
- **Filtering**: Filter by city and topic/category
- **Search**: Search through news articles
- **Pull-to-Refresh**: Refresh news feed
- **Error Handling**: Graceful handling of network errors and validation failures

## Setup Instructions

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (for iOS testing)
- Android Studio with Android Emulator (for Android testing)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd React-native-Assignment
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Run on platforms**
   - **iOS**: Press `i` in the terminal or scan QR code with Expo Go app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

### Testing the App

1. **News Submission Flow**:
   - Navigate to "Submit News" screen
   - Fill out all required fields (title, description ≥50 chars, city, topic, publisher name, phone)
   - Optionally add an image
   - Submit and observe AI validation process

2. **News Feed Flow**:
   - View approved news in the feed
   - Test bookmarking functionality
   - Test filtering by city and topic
   - Test search functionality
   - Test pull-to-refresh

3. **Validation Testing**:
   - Try submitting with missing fields
   - Try submitting with description < 50 characters
   - Try submitting spam content (contains "buy now", "click here", etc.)
   - Try submitting sensitive content (contains "violence", "hate", etc.)

## GPT Implementation

### Current Implementation (Mock)
The app currently uses a mock GPT service that simulates AI validation and editing. The mock service:

1. **Validates Content**:
   - Checks for spam keywords: `buy now`, `click here`, `free money`, `lottery`, `viagra`
   - Checks for sensitive content: `violence`, `hate`, `discrimination`, `illegal`
   - Validates minimum character requirements (50+ characters)
   - Ensures local news relevance by checking for keywords: `accident`, `festival`, `community event`, `local`, `city`, `town`

2. **Edits Content**:
   - Improves titles with appropriate prefixes (Local, Community, City, Town)
   - Creates concise, news-like summaries
   - Maintains original meaning while improving readability

### Mock Validation Rules:
- **Content Length**: Minimum 50 characters required
- **Spam Detection**: Rejects content containing spam keywords
- **Sensitive Content**: Flags and rejects inappropriate content
- **Local Relevance**: Ensures content relates to local community events
- **Auto-Approval**: Content meeting all criteria is automatically approved

### Production Implementation
To use real OpenAI API:

1. **Get OpenAI API Key**:
   - Sign up at https://openai.com
   - Generate an API key from https://platform.openai.com/api-keys

2. **Configure API Key**:
   - Open `src/config/openai.js`
   - Replace `'your-openai-api-key-here'` with your actual API key
   - The file is already in .gitignore for security

3. **Test the API**:
   - Submit news through the app
   - The real GPT-4o-mini will validate and edit your content

### GPT Prompt Design

The GPT service is designed to:
1. **Check Relevance**: Ensure news relates to local happenings
2. **Improve Writing**: Rewrite into clean, concise news snippets
3. **Flag Sensitive Content**: Reject harmful or inappropriate content
4. **Return Structured Response**: JSON with approval status, edited content, and reasoning

## Architecture

### Project Structure
```
src/
├── context/
│   └── NewsContext.js          # State management
├── screens/
│   ├── NewsSubmissionScreen.js # News submission form
│   └── NewsFeedScreen.js       # News feed display
└── services/
    └── gptService.js           # AI validation service
```

### Key Components

1. **NewsContext**: Manages app state, data persistence, and filtering
2. **NewsSubmissionScreen**: Handles form input, validation, and AI submission
3. **NewsFeedScreen**: Displays news with filtering and bookmarking
4. **GPT Service**: Handles AI validation and content editing

### Data Flow
1. User submits news → Form validation
2. Valid form → GPT validation/editing
3. GPT approval → Store in local storage
4. Display in news feed with filtering options

## Limitations and Assumptions

### Current Limitations
- **Mock GPT Service**: Uses simulated AI responses instead of real OpenAI API
- **Local Storage Only**: Data persists only on device (no cloud sync)
- **Basic UI**: Focus on functionality over advanced design
- **No Authentication**: No user accounts or personal data protection

### Assumptions
- **Network Availability**: Assumes stable internet for GPT API calls
- **Device Storage**: Assumes sufficient local storage for news data
- **Image Permissions**: Assumes camera/gallery permissions are granted
- **Platform Compatibility**: Assumes Expo compatibility across devices

### Future Improvements
- Real OpenAI API integration
- Cloud database for data persistence
- User authentication system
- Push notifications for new news
- Advanced analytics and reporting
- Offline mode support
- Image compression and optimization

## Testing

### Manual Testing Checklist
- [ ] Form validation (required fields, character limits)
- [ ] Image upload (gallery and camera)
- [ ] GPT validation (approval and rejection scenarios)
- [ ] News feed display and navigation
- [ ] Bookmarking functionality
- [ ] Filtering by city and topic
- [ ] Search functionality
- [ ] Pull-to-refresh
- [ ] Error handling and user feedback
- [ ] Data persistence across app restarts

### Platform Testing
- [ ] iOS Simulator
- [ ] Android Emulator
- [ ] Physical iOS device (via Expo Go)
- [ ] Physical Android device (via Expo Go)

## Build Instructions

### Android APK
```bash
expo build:android
```

### iOS Build
```bash
expo build:ios
```

## Dependencies

### Core Dependencies
- `expo`: React Native framework
- `react-navigation`: Navigation between screens
- `react-native-paper`: UI components
- `expo-image-picker`: Image selection
- `@react-native-async-storage/async-storage`: Data persistence

### Development Dependencies
- `@babel/core`: JavaScript compilation
- `expo-cli`: Development tools

## Support

For issues or questions:
1. Check the console for error messages
2. Ensure all dependencies are installed
3. Clear Expo cache: `expo start -c`
4. Reset Metro bundler: `expo start --clear`

## License

This project is created for the React Native assignment by Camorent Engineering. 