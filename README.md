# AcousticText - AI Text Humanizer SaaS

Welcome to the ultimate AI Text Humanizer SaaS application! This project demonstrates how to build a fully featured, production-ready SaaS platform using the latest technologies — Next.js 15, Neon (PostgreSQL), Polar payments, Better Auth authentication, and OpenAI for AI-powered text humanization — all deployed on Vercel.

## Useful Links
 
- **Neon** → https://get.neon.com/BzsDb4L  
- **OpenAI** → https://openai.com
- **Polar** → https://polar.sh
- **Better Auth** → https://better-auth.com 

## Key Features  
 
- **Secure Authentication**: Email, password & social logins with Better Auth   
- **Payments & Credits**: Integrated payment system with Polar
- **AI-Powered Text Humanization**: Advanced AI text humanization with OpenAI GPT-4
- **AI Detection Bypass**: Sophisticated algorithms to pass AI detection tests
- **Multiple Presets**: Casual, Professional, Minimal Errors, and Playful styles
- **File Upload Support**: Upload .txt, .docx, and .md files for humanization
- **Real-time Preview**: Live preview of humanized text with diff comparison
- **History Management**: Save and manage humanization history
- **Customer Portal**: Invoices, billing info & credit pack management
- **Responsive Design**: Modern UI that works on all devices
- **Real-time Updates**: Live credit deduction and status updates 
- **Professional Layout**: Smooth transitions and polished SaaS interface
- **Serverless Deployment**: Scalable hosting on Vercel
 
## Built With

- **Frontend**: Next.js 15 (App Router + Server Actions)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Database**: Neon PostgreSQL + Prisma ORM
- **Payments**: Polar payment platform
- **Authentication**: Better Auth
- **AI Processing**: OpenAI GPT-4 for text humanization
- **File Processing**: Mammoth.js for .docx file parsing
- **Deployment**: Vercel (free tier available)

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/ai-text-humanizer-saas-app.git
   cd ai-text-humanizer-saas-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables for Neon, OpenAI, Polar, and Better Auth.

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3050`

## Environment Variables

Create a `.env.local` file with the following variables:

```env
# Database
DATABASE_URL="your_neon_database_url"

# Authentication
BETTER_AUTH_SECRET="your_better_auth_secret"
BETTER_AUTH_URL="http://localhost:3050"

# OpenAI
AISTUDIOS_API_KEY="your_openai_api_key"

# Polar Payments
POLAR_ACCESS_TOKEN="your_polar_access_token"
POLAR_WEBHOOK_SECRET="your_polar_webhook_secret"
```

## Features Overview

### AI Text Humanization
- **Advanced AI Processing**: Uses OpenAI GPT-4 for sophisticated text humanization
- **Multiple Attempts**: Automatically retries with different parameters to achieve optimal results
- **AI Detection Bypass**: Implements sophisticated algorithms to pass AI detection tests
- **Post-Processing**: Adds human-like imperfections including typos, punctuation variations, and natural language patterns

### Humanization Presets
- **Minimal Errors**: Subtle humanization with few typos (3% typo rate)
- **Casual**: Natural conversational tone (6% typo rate, 18% lowercase variations)
- **Professional**: Clean, business-appropriate style (2% typo rate, 6% lowercase variations)
- **Playful**: More creative and informal (8% typo rate, 18% filler words)

### File Support
- **Text Input**: Direct text input with auto-resizing textarea
- **File Upload**: Support for .txt, .docx, and .md files
- **Export Options**: Download humanized text as .txt or .docx files

### User Experience
- **Real-time Preview**: Live preview of humanized text
- **Diff Comparison**: Side-by-side comparison of original and humanized text
- **History Management**: Complete history of all humanizations with metadata
- **Credit System**: Token-based credit system with real-time updates
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## API Endpoints

### POST /api/humanizer
Humanizes text using AI with advanced detection bypass.

**Request Body:**
```json
{
  "text": "Text to humanize",
  "preset": "casual",
  "options": {}
}
```

**Response:**
```json
{
  "humanized_text": "Humanized version of the text",
  "ai_score": 85.5,
  "detector_result": {
    "passed": true,
    "score": 15,
    "method": "openai-detection"
  },
  "tokens_used": 150,
  "credits_used": 2,
  "credits_remaining": 48,
  "meta": {
    "preset": "casual",
    "attempts": 1,
    "source": "ai-studios-openai",
    "fallback": false
  }
}
```

## Database Schema

The application uses a PostgreSQL database with the following key tables:

- **User**: User accounts with credit management
- **HumanizerHistory**: Complete history of text humanizations
- **Session**: User authentication sessions
- **Account**: OAuth account connections

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Test humanization algorithms and API adapters
- **Integration Tests**: Test API endpoints with mocked responses
- **Postman Collection**: Manual testing collection included

Run tests with:
```bash
npm test
```

## Deployment

The application is designed for easy deployment on Vercel:

1. Connect your GitHub repository to Vercel
2. Set up environment variables in Vercel dashboard
3. Deploy automatically on every push to main branch

## What You'll Learn

This project is perfect for developers who want to learn:

- **Modern Full-Stack Development** with Next.js 15
- **SaaS Application Architecture** and best practices
- **AI Text Processing Integration** with OpenAI
- **Payment Systems Implementation** using Polar
- **Advanced Authentication** with Better Auth
- **Database Design and Management** with Prisma
- **AI Detection Bypass Techniques**
- **Serverless Deployment** strategies

## Perfect For

- Full-stack developers looking to build SaaS applications
- Next.js enthusiasts wanting to explore the latest features
- Developers interested in AI integration and text processing
- Anyone learning modern web development practices
- Content creators needing AI detection bypass tools

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- OpenAI for providing powerful AI text processing capabilities
- Neon for the amazing PostgreSQL hosting platform
- Polar for the seamless payment integration
- Better Auth for the robust authentication system

---

If you found this project helpful, please give it a ⭐ on GitHub and consider following for more amazing projects!


**#nextjs #ai #saas #fullstackdevelopment #openai #texthumanizer**








