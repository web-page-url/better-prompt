# Better Prompt - AI Prompt Optimizer

A sleek, mobile-responsive web app built with Next.js and Tailwind CSS that transforms raw or unclear text prompts into well-structured, optimized AI prompts using OpenRouter's LLM API.

![Better Prompt Screenshot](https://via.placeholder.com/800x400?text=Better+Prompt+App)

## ✨ Features

- **Smart Prompt Optimization**: Transform vague prompts into clear, detailed, and highly effective prompts
- **Multiple AI Models**: Choose from GPT-4, Claude, Mistral, and free models via OpenRouter
- **Advanced Options**: Select tone (professional, casual, creative) and type (code generation, content writing, etc.)
- **Responsive Design**: Beautiful UI that works on all devices
- **Dark Mode Support**: Automatic dark/light theme switching
- **Copy & Regenerate**: Easy copying and re-generation of optimized prompts
- **Example Prompts**: Quick-start examples for common use cases

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenRouter API key (get one free at [openrouter.ai](https://openrouter.ai))

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd better-prompt
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the example env file
   cp env.example .env.local
   
   # Edit .env.local and add your OpenRouter API key
   OPENROUTER_API_KEY=your_openrouter_api_key_here
   ```

4. **Run the development server**
```bash
npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file with:

```env
# Required: Your OpenRouter API key
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Site URL for OpenRouter headers
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Supported Models

- **Free Models**: Llama 3.1 8B, Mistral 7B
- **Premium Models**: GPT-4 Omni Mini, Claude 3 Haiku
- **Custom Models**: Easily add more in `src/app/page.tsx`

## 📖 Usage

### Basic Usage

1. Enter your raw prompt in the textarea
2. Click "Optimize Prompt"
3. Copy the improved result
4. Use with your favorite AI model

### Advanced Options

Click "Advanced" to access:
- **Model Selection**: Choose your preferred AI model
- **Tone**: Professional, casual, friendly, authoritative, or creative
- **Type**: General, code generation, content writing, data analysis, creative writing, or research

### Example Transformations

**Before:**
```
Write email to boss about leave
```

**After:**
```
Please help me draft a professional email to my supervisor requesting time off. The email should:
- Be respectful and professional in tone
- Include specific dates for the requested leave
- Provide adequate notice period
- Mention any work coverage arrangements
- Express willingness to discuss further if needed
- Follow standard business email format

Please make it concise yet comprehensive, ensuring all necessary information is included while maintaining a courteous and professional demeanor.
```

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **AI Provider**: OpenRouter API
- **Deployment**: Vercel (recommended)

## 🚀 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/better-prompt)

1. Connect your GitHub repository to Vercel
2. Add your `OPENROUTER_API_KEY` in the environment variables
3. Deploy!

### Deploy to Other Platforms

The app works on any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🧪 Testing

Test the app with these example prompts:

- "Write email to boss about leave"
- "build me a startup idea"
- "python code for image caption"
- "help me learn react hooks"
- "create marketing copy for my product"

## 🔒 Security

- API keys are securely stored in environment variables
- Server-side API calls protect your OpenRouter key
- No prompt data is stored or logged
- Rate limiting can be added in production

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 💝 Credits

- Powered by [OpenRouter](https://openrouter.ai)
- Built with [Next.js](https://nextjs.org)
- Styled with [Tailwind CSS](https://tailwindcss.com)
- Icons by [Lucide](https://lucide.dev)

---

**Happy prompting!** 🚀✨
#   b e t t e r - p r o m p t 
 
 