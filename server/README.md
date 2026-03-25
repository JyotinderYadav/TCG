# Testcase Generator - Server

Express.js backend server for the Testcase Generator application. Provides AI-powered test case generation using Groq.

## 🎯 Features

- **AI-Powered Test Generation**: Uses Groq API for intelligent test case creation
- **RESTful API**: Simple and intuitive API endpoints
- **CORS Enabled**: Works seamlessly with frontend applications
- **Environment Configuration**: Secure API key management with dotenv
- **Hot Reload**: Development server with nodemon

## 🛠️ Technology Stack

- **Express.js**: v5.2.1 - Web framework
- **Groq SDK**: v1.1.1 - AI inference engine
- **Anthropic SDK**: v0.80.0 - Alternative AI support
- **CORS**: v2.8.6 - Cross-origin resource sharing
- **Dotenv**: v17.3.1 - Environment configuration
- **Nodemon**: Development tool for auto-reload

## 📦 Installation

```bash
npm install
```

## 🔑 Configuration

Create a `.env` file in the server directory:

```env
GROQ_API_KEY=your_groq_api_key_here
PORT=5000
NODE_ENV=development
```

**Get your Groq API key:**

1. Visit [https://console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Create an API key
4. Add it to your `.env` file

## 🚀 Development

Start the development server with hot reload:

```bash
npm run dev
```

The server will run at `http://localhost:5000`

## 📝 API Endpoints

### POST /api/generate-tests

Generate test cases for code snippets.

**Request:**

```bash
curl -X POST http://localhost:5000/api/generate-tests \
  -H "Content-Type: application/json" \
  -d '{
    "code": "function add(a, b) { return a + b; }",
    "language": "javascript",
    "framework": "jest"
  }'
```

**Request Body:**

```json
{
  "code": "string - The code to analyze",
  "language": "string - Programming language (e.g., javascript, python, java)",
  "framework": "string - Testing framework (e.g., jest, pytest, junit)"
}
```

**Response (200 OK):**

```json
{
  "testCases": [
    {
      "name": "string - Test case name",
      "input": "string - Input parameters",
      "expected": "string - Expected output"
    }
  ],
  "edgeCases": [
    {
      "name": "string - Edge case name",
      "description": "string - Description"
    }
  ],
  "errorScenarios": [
    {
      "scenario": "string - Error scenario",
      "handling": "string - How to handle"
    }
  ],
  "performance": ["string - Performance consideration"]
}
```

## 📁 Project Structure

```
server/
├── index.js           # Main server file
├── package.json       # Dependencies
├── .env              # Environment variables (not in repo)
└── README.md         # This file
```

## 🔄 How It Works

1. Client sends code, language, and framework to the server
2. Server constructs a detailed prompt with context
3. Groq AI analyzes the code and generates test cases
4. Server structures the response with:
   - **Test Cases**: Happy path and normal scenarios
   - **Edge Cases**: Boundary and special conditions
   - **Live Bugs** (Code Snippet mode only): Real-time detection while typing
   - **Bugs & Fixes**: Detailed analysis and solutions
   - **Executable Code**: Ready-to-use test implementations

## 💡 Prompt Structure

The server generates intelligent test cases by:

- **Analyzing code structure** for all supported languages (JavaScript, Python, Java, Go, C++)
- **Generating test cases** (happy path, normal scenarios)
- **Finding edge cases** (boundaries, special conditions)
- **Detecting bugs** (potential issues and fixes)
- **Supporting three modes**:
  - Code Snippet: Analyze functions for bugs
  - API Definition: Create comprehensive API tests
  - User Story: Generate acceptance test criteria

## 🔒 Error Handling

- Returns appropriate HTTP status codes
- Provides meaningful error messages
- Handles API failures gracefully
- Logs errors for debugging

## 📊 Supported Languages

- **JavaScript**: ES6+ syntax and async patterns
- **Python**: Function and class-based code
- **Java**: Methods, classes, and OOP patterns
- **Go**: Functions with error handling
- **C++**: Classes, templates, and algorithms

## 🧪 Testing Frameworks

| Language   | Framework  | Status       |
| ---------- | ---------- | ------------ |
| JavaScript | Jest       | ✅ Supported |
| Python     | pytest     | ✅ Supported |
| Java       | JUnit      | ✅ Supported |
| Go         | testing    | ✅ Supported |
| C++        | GoogleTest | ✅ Supported |

## 🚀 Production Deployment

### Environment Variables for Production

```env
GROQ_API_KEY=your_production_api_key
PORT=3000
NODE_ENV=production
```

### Running in Production

```bash
npm install --production
node index.js
```

### Using PM2

```bash
npm install -g pm2
pm2 start index.js --name "testcase-generator"
pm2 save
pm2 startup
```

## 🐛 Debugging

Enable debug logs by setting:

```bash
DEBUG=* npm run dev
```

## 📚 Dependencies

| Package           | Version | Purpose                  |
| ----------------- | ------- | ------------------------ |
| express           | ^5.2.1  | Web framework            |
| groq-sdk          | ^1.1.1  | Groq AI API              |
| @anthropic-ai/sdk | ^0.80.0 | Anthropic API (optional) |
| cors              | ^2.8.6  | CORS middleware          |
| dotenv            | ^17.3.1 | Environment config       |
| nodemon           | ^3+     | Development tool         |

## 📄 License

ISC License - see the LICENSE file for details.

## 🤝 Contributing

Please follow these guidelines:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 💬 Support

For issues or questions:

- Check existing issues on GitHub
- Open a new issue with detailed information
- Include error logs and environment details

---

**Part of the Testcase Generator Project**
