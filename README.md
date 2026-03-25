# Testcase Generator

An intelligent AI-powered test case generator that automatically creates comprehensive test cases for your code. Built with React and Express, enhanced with Groq AI for intelligent test case generation.

## 📋 Features

- **Three Input Modes**:
  - 💻 **Code Snippet**: Paste functions and classes for live bug detection
  - 🌐 **API Definition**: Describe REST endpoints for full API test generation
  - 📖 **User Story**: Write feature requirements for acceptance tests
- **AI-Powered Test Generation**: Uses Groq AI to generate comprehensive test cases
- **Multi-Language Support**: JavaScript, Python, Java, Go, C++
- **Framework Integration**: Jest, pytest, JUnit, testing, GoogleTest
- **Real-time Editing**: Monaco Editor for seamless code editing
- **Structured Output**: Test cases, edge cases, bug detection, and executable code

## 📁 Project Structure

```
testcase-generator/
├── client/                 # React frontend application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── assets/
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── server/                 # Express backend server
│   ├── index.js
│   └── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- npm or yarn
- Groq API key ([Get one here](https://console.groq.com))

### Installation

1. **Clone the repository**

```bash
git clone https://github.com/yourusername/testcase-generator.git
cd testcase-generator
```

2. **Setup Server**

```bash
cd server
npm install
# Create .env file and add your Groq API key
echo "GROQ_API_KEY=your_api_key_here" > .env
npm run dev
```

3. **Setup Client** (in a new terminal)

```bash
cd client
npm install
npm run dev
```

The application will be available at `http://localhost:5173`

## 🔧 Configuration

### Server Environment Variables

Create a `.env` file in the `server` directory:

```env
GROQ_API_KEY=your_groq_api_key
PORT=5000
NODE_ENV=development
```

## 📚 Usage

1. **Select Input Mode**: Choose between Code Snippet, API Definition, or User Story
2. **Paste Your Input**: Add your code, API definition, or user story
3. **Select Language & Framework**: Pick from JavaScript, Python, Java, Go, or C++
4. **Click Generate Tests**: AI will analyze and generate tests
5. **Review Results** in this order:
   - ✅ **Test Cases** - Happy path and normal scenarios
   - ⚠️ **Edge Cases** - Boundary conditions and special cases
   - 🔴 **Live Bugs** (Code Snippet mode) - Real-time bug detection while typing
   - 🐛 **Bugs & Fixes** - Found issues with solutions
   - ⚡ **Executable Code** - Ready-to-use test code

## 🛠️ Development

### Backend

- **Framework**: Express.js
- **AI Engine**: Groq SDK
- **Dependencies**: cors, dotenv, express, groq-sdk

### Frontend

- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Editor**: Monaco Editor
- **HTTP Client**: Axios

### Available Scripts

**Client:**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run lint     # Run ESLint
npm run preview  # Preview production build
```

**Server:**

```bash
npm run dev      # Start development server with nodemon
npm run test     # Run tests
```

## 📝 API Endpoints

### POST /api/generate-tests

Generates test cases for the provided code.

**Request Body:**

```json
{
  "code": "your code here",
  "language": "javascript",
  "framework": "jest"
}
```

**Response:**

```json
{
  "testCases": [...],
  "edgeCases": [...],
  "errorScenarios": [...],
  "performance": [...]
}
```

## 📊 Supported Languages & Frameworks

| Language       | Framework  | Mode             |
| -------------- | ---------- | ---------------- |
| **JavaScript** | Jest       | Code, API, Story |
| **Python**     | pytest     | Code, API, Story |
| **Java**       | JUnit      | Code, API, Story |
| **Go**         | testing    | Code, API, Story |
| **C++**        | GoogleTest | Code, API, Story |

### Input Modes

- **💻 Code Snippet**: Analyze functions and classes for potential bugs, edge cases, and test coverage
- **🌐 API Definition**: Generate comprehensive test cases for REST endpoints, including success and error scenarios
- **📖 User Story**: Create acceptance test criteria based on feature requirements

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

## 🙋 Support

For support, please open an issue on GitHub or contact the development team.

## 🔗 Links

- [Groq AI](https://groq.com)
- [React Documentation](https://react.dev)
- [Express Documentation](https://expressjs.com)
- [Vite Documentation](https://vitejs.dev)

---

**Made with ❤️ at Hackathon**
