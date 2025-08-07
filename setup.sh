#!/bin/bash

echo "🚀 Setting up Local News App..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ npm version: $(npm --version)"

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "📦 Installing Expo CLI..."
    npm install -g @expo/cli
fi

echo "✅ Expo CLI version: $(expo --version)"

# Install dependencies
echo ""
echo "📦 Installing project dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies. Please try again."
    exit 1
fi

echo ""
echo "🎉 Setup completed successfully!"
echo ""
echo "📱 To run the app:"
echo "   npm start"
echo ""
echo "📋 Available commands:"
echo "   npm start          - Start the development server"
echo "   npm run android    - Run on Android"
echo "   npm run ios        - Run on iOS"
echo "   npm run web        - Run on web"
echo ""
echo "📱 Testing on devices:"
echo "   - Install Expo Go app on your phone"
echo "   - Scan the QR code that appears when you run npm start"
echo ""
echo "🔧 For real OpenAI API integration:"
echo "   1. Get API key from https://openai.com"
echo "   2. Update src/services/gptService.js"
echo "   3. Add API key to environment variables"
echo ""
echo "📚 For more information, see README.md" 