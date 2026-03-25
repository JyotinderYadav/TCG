# Testcase Generator - Client

A modern React-based frontend for the Testcase Generator application. Built with Vite, React 19, Tailwind CSS, and Monaco Editor.

## 🎯 Features

- **Three Input Modes**:
  - 💻 Code Snippet mode - Analyze functions and detect bugs
  - 🌐 API Definition mode - Test REST endpoints
  - 📖 User Story mode - Generate acceptance tests
- **Monaco Editor Integration**: Professional code editing with syntax highlighting for JS, Python, Java, Go, C++
- **Responsive Design**: Built with Tailwind CSS for mobile and desktop
- **Live Sample Switching**: Quick templates for different languages
- **Framework Selection**: Automatic framework selection based on language

## 🛠️ Technology Stack

- **React**: v19.2.4 - UI framework
- **Vite**: v5+ - Build tool and dev server
- **Tailwind CSS**: v4+ - Styling
- **Monaco Editor**: v4.7.0 - Code editor
- **Axios**: v1.13.6 - HTTP client
- **ESLint**: Code quality tool

## 📦 Installation

```bash
npm install
```

## 🚀 Development

Start the development server:

```bash
npm run dev
```

The application will open at `http://localhost:5173`

## 🏗️ Building

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## 🔍 Linting

Check code quality:

```bash
npm run lint
```

## 📁 Project Structure

```
src/
├── App.jsx           # Main App component
├── main.jsx          # Entry point
├── App.css           # Component styles
├── index.css         # Global styles
└── assets/           # Static assets
```

## 🔌 API Integration

The client communicates with the backend server at:

```
http://localhost:5000
```

### Example API Call

```javascript
import axios from "axios";

const generateTests = async (code, language, framework) => {
  const response = await axios.post(
    "http://localhost:5000/api/generate-tests",
    { code, language, framework },
  );
  return response.data;
};
```

## 📚 Key Components

- **Mode Selector**: Switch between Code Snippet, API Definition, and User Story modes
- **Code Editor**: Monaco editor with language-specific syntax highlighting
- **Sample Loader**: Quick templates for each mode and language
- **Language Selector**: Choose from JavaScript, Python, Java, Go, or C++
- **Results Display** (in order):
  - Test Cases (blue card) - Core test scenarios
  - Edge Cases (amber card) - Boundary conditions
  - Live Bug Panel (red) - Real-time bug detection for Code Snippet mode
  - Bugs & Fixes (red card) - Detailed bug analysis
  - Executable Code (purple) - Copy-ready test code
- **Glass Card UI**: Modern glass-morphism design for visual hierarchy

## � Supported Languages & Input Modes

### Languages

- **JavaScript** - ES6+, async/await, Promises
- **Python** - Synchronous and asynchronous functions
- **Java** - OOP, generics, annotations
- **Go** - Functions, goroutines, error handling
- **C++** - Classes, templates, STL

### Input Modes

1. **💻 Code Snippet** - Upload functions or classes for live bug detection and test generation
2. **🌐 API Definition** - Describe REST endpoints to generate comprehensive API tests
3. **📖 User Story** - Write feature requirements to generate acceptance test criteria

## �🎨 Styling

This project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

## 📝 Environment Variables

Create a `.env.local` file if you need custom backend URL:

```env
VITE_API_URL=http://localhost:5000
```

## 🔧 ESLint Configuration

ESLint configuration is in `eslint.config.js`. Run `npm run lint` to check code quality.

## 📄 License

ISC License - see the LICENSE file for details.

## 🤝 Contributing

Please open an issue or submit a pull request with improvements.

---

**Part of the Testcase Generator Project**
