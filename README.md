<div align="center">

# 🔐 Elite JS Obfuscator

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel">
</p>

<p align="center">
  <b>A powerful web-based tool to securely clone, obfuscate, and mirror GitHub repositories with advanced JavaScript protection.</b>
</p>

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-tech-stack">Tech Stack</a> •
  <a href="#-installation">Installation</a> •
  <a href="#-usage">Usage</a> •
  <a href="#-deployment">Deployment</a> •
  <a href="#-api">API</a> •
  <a href="#-contributing">Contributing</a> •
  <a href="#-license">License</a>
</p>

---

</div>

## 🌟 Features

- **🔒 Advanced JavaScript Obfuscation** - Protect your code with military-grade obfuscation techniques
- **🔄 Repository Mirroring** - Clone and mirror GitHub repositories seamlessly
- **⚡ One-Click Deployment** - Simple web interface for quick obfuscation
- **🎨 Modern UI/UX** - Beautiful, responsive design with glassmorphism effects
- **🔐 Secure Processing** - GitHub tokens are never stored or logged
- **📦 Batch Processing** - Automatically processes all JavaScript files in a repository
- **⚙️ Smart Filtering** - Skips configuration files (settings.js, config.js) automatically
- **🚀 Real-time Progress** - Live updates during the obfuscation process
- **💾 Form Persistence** - Auto-saves form data for convenience
- **🌐 Vercel Ready** - Optimized for serverless deployment

## 🛠 Tech Stack

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **javascript-obfuscator** - Advanced JavaScript obfuscation library
- **simple-git** - Git command wrapper for Node.js
- **body-parser** - Request body parsing middleware
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Modern markup
- **CSS3** - Advanced styling with gradients and glassmorphism
- **Vanilla JavaScript** - No framework overhead
- **Google Fonts (Inter)** - Clean, professional typography

### DevOps
- **Vercel** - Serverless deployment platform
- **Nodemon** - Development auto-reload
- **Git** - Version control

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v6.0.0 or higher) - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)
- **GitHub Account** - For repository access
- **GitHub Personal Access Token** - [Create one here](https://github.com/settings/tokens)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/mrfr8nk/elitejsobfuscater.git
cd elitejsobfuscater
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup (Optional)

Create a `.env` file in the root directory:

```env
PORT=7860
NODE_ENV=development
```

### 4. Run the Application

#### Development Mode (with auto-reload)
```bash
npm run dev
```

#### Production Mode
```bash
npm start
```

The application will be available at `http://localhost:7860`

## 📖 Usage

### Web Interface

1. **Navigate to the application** in your browser
2. **Fill in the form fields:**
   - **Source GitHub Repo URL**: The repository you want to obfuscate (e.g., `https://github.com/username/source-repo`)
   - **Destination GitHub Repo URL**: Where the obfuscated code will be pushed (e.g., `https://github.com/username/dest-repo`)
   - **GitHub Personal Access Token**: Your GitHub PAT with `repo` permissions
   - **Git Commit Username**: Your GitHub username
   - **Git Commit Email**: Your GitHub email

3. **Click "Obfuscate & Push"** and watch the magic happen!

4. **Monitor progress** through the real-time progress tracker

### Obfuscation Features

The obfuscator applies the following transformations:

- ✅ **Control Flow Flattening** - Makes code flow harder to understand
- ✅ **Dead Code Injection** - Adds confusing but harmless code
- ✅ **String Array Encoding** - Encrypts strings using RC4 encoding
- ✅ **Code Compacting** - Removes whitespace and formatting
- ✅ **Custom Banner** - Adds "Powered by MR FRANK 😎" header

### Files Excluded from Obfuscation

- `settings.js`
- `config.js`
- Non-JavaScript files

## 🌐 Deployment

### Deploy to Vercel (Recommended)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mrfr8nk/elitejsobfuscater)

#### Manual Deployment

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Deploy:**
```bash
vercel
```

3. **Set Environment Variables** (if needed) in Vercel Dashboard

### Deploy to Heroku

```bash
heroku create your-app-name
git push heroku main
```

### Deploy to Other Platforms

The application is compatible with:
- **Railway**
- **Render**
- **DigitalOcean App Platform**
- **AWS Elastic Beanstalk**
- **Google Cloud Run**

## 🔌 API

### POST `/obfuscate`

Obfuscates a GitHub repository and pushes it to a destination repository.

#### Request Body (application/x-www-form-urlencoded)

```javascript
{
  "sourceRepo": "https://github.com/user/source",
  "destRepo": "https://github.com/user/destination",
  "token": "ghp_xxxxxxxxxxxx",
  "gitUser": "username",
  "gitEmail": "user@example.com"
}
```

#### Response (JSON)

**Success:**
```json
{
  "success": true,
  "message": "Obfuscation complete and pushed to destination repo!"
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error: [error details]"
}
```

## 🎨 Customization

### Modify Obfuscation Settings

Edit `obfuscate.js` to customize obfuscation parameters:

```javascript
const obfuscationResult = JavaScriptObfuscator.obfuscate(code, {
  compact: true,
  controlFlowFlattening: true,
  deadCodeInjection: true,
  stringArray: true,
  stringArrayEncoding: ['rc4'],
  stringArrayThreshold: 0.75,
  // Add more options from javascript-obfuscator docs
});
```

### Change Banner Text

Modify the banner in `obfuscate.js`:

```javascript
const obfuscatedCode =
  (options.banner || '// Your Custom Banner\n') +
  obfuscationResult.getObfuscatedCode();
```

### Customize UI Theme

Edit CSS variables in `public/index.html`:

```css
:root {
  --bg-start: #0b1220;
  --bg-end: #251148;
  --primary: #7c3aed;
  --accent: #0ea5e9;
  /* Customize colors */
}
```

## 🔒 Security Considerations

- ⚠️ **Never commit your `.env` file** with sensitive tokens
- ⚠️ **Use GitHub tokens with minimal required permissions** (only `repo` scope)
- ⚠️ **Tokens are processed in memory** and never stored on disk
- ⚠️ **The app uses ephemeral storage** (`/tmp`) for temporary repositories
- ⚠️ **HTTPS is enforced** for all repository URLs
- ⚠️ **Force push is used** - ensure destination repo is dedicated for obfuscated code

## 📚 Advanced Usage

### Run as a Module

You can use the obfuscator programmatically:

```javascript
const obfuscateDirectory = require('./obfuscate');

obfuscateDirectory('/path/to/your/project', {
  banner: '// Custom banner text\n'
});
```

### Exclude Additional Files

Modify the exclusion logic in `obfuscate.js`:

```javascript
if (file === 'settings.js' || file === 'config.js' || file === 'yourfile.js') {
  console.log(`Skipping ${file}`);
  continue;
}
```

## 🧪 Development

### Project Structure

```
elitejsobfuscater/
├── public/
│   └── index.html          # Frontend UI
├── obfuscate.js            # Obfuscation logic
├── server.js               # Express server
├── package.json            # Dependencies
├── vercel.json             # Vercel configuration
└── README.md               # Documentation
```

### Available Scripts

```bash
npm start       # Start production server
npm run dev     # Start development server with auto-reload
```

### Adding Features

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🐛 Troubleshooting

### Common Issues

**Issue:** Port already in use
```bash
# Solution: Change port in .env or kill process
PORT=8080 npm start
```

**Issue:** GitHub authentication failed
```bash
# Solution: Verify your PAT has 'repo' permissions
# Regenerate token at: https://github.com/settings/tokens
```

**Issue:** Obfuscation fails
```bash
# Solution: Check if source repo contains valid JavaScript files
# Ensure you have read access to source repo
```

## 📊 Performance

- **Processing Speed**: ~100-500 files per minute (depends on file size)
- **Memory Usage**: ~50-200MB during obfuscation
- **Supported File Size**: Up to 10MB per JavaScript file
- **Concurrent Requests**: Supports multiple simultaneous obfuscations

## 🤝 Contributing

Contributions are what make the open-source community amazing! Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Code of Conduct

Please be respectful and constructive in all interactions.

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

## 💖 Support

If you find this project helpful, please consider:

- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting new features
- 📖 Improving documentation

## 👨‍💻 Author

<div align="center">

### **Mr Frank**

[![Portfolio](https://img.shields.io/badge/Portfolio-mrfrankofc-blue?style=for-the-badge)](https://mrfrankofc.com)
[![Website](https://img.shields.io/badge/Website-Gleeze.com-green?style=for-the-badge)](https://gleeze.com)
[![GitHub](https://img.shields.io/badge/GitHub-mrfr8nk-black?style=for-the-badge&logo=github)](https://github.com/mrfr8nk)

**Crafted with ❤️ and ☕ by Mr Frank**

</div>

## 🔗 Related Projects

- [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) - The core obfuscation library
- [simple-git](https://github.com/steveukx/git-js) - Git operations in Node.js

## 🙏 Acknowledgments

- Thanks to the [javascript-obfuscator](https://github.com/javascript-obfuscator/javascript-obfuscator) team for the amazing obfuscation library
- Inspired by the need for code protection in open-source projects
- Built with passion for the developer community

---

<div align="center">

**⚡ Powered by JavaScript Obfuscator · Secured with ❤️**

*If you have any questions or need help, feel free to open an issue!*

[⬆ Back to Top](#-elite-js-obfuscator)

</div>
