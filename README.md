# DocuAI Platform: AI-Powered Document Processing System

A full-stack document processing application that transforms complex document workflows through intelligent AI-powered extraction and analysis.



## Features

- **Intelligent Document Processing**: Extract key information from documents using AI
- **Multi-Provider AI Integration**: Optimize costs by routing to different LLM providers (OpenAI, Anthropic, Perplexity)
- **Smart Routing Logic**: Automatically select the appropriate LLM provider based on document characteristics
- **Real-time Status Updates**: Track document processing with WebSocket-based real-time updates
- **Comprehensive Document Analytics**: View processing statistics and historical data
- **Responsive Design**: Fully functional on both desktop and mobile devices

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn/UI components
- **Backend**: Express.js, Node.js, WebSockets
- **Database**: PostgreSQL with Drizzle ORM
- **AI Integration**: OpenAI, Anthropic Claude, Perplexity AI
- **PDF Processing**: PDF.js for text extraction

## Architecture

The application uses a multi-layered approach to document processing:

1. **Metadata Extraction**: Document metadata is extracted first (page count, file size, etc.)
2. **Pattern Matching**: Cost-effective regex pattern matching is attempted before API calls
3. **Smart Routing**: Documents are routed to the appropriate LLM provider based on content type
4. **Data Extraction**: Structured data is extracted from documents using AI
5. **Data Storage**: Results are stored in the database for later retrieval

## Getting Started

### Prerequisites

- Node.js (v16+)
- PostgreSQL database
- API keys for at least one of: OpenAI, Anthropic, or Perplexity

## Running in VS Code

### Step 1: Set up the project

1. Clone the repository to your local machine:
   ```bash
   git clone https://github.com/yourusername/docuai-platform.git
   cd docuai-platform
   ```

2. Open the project in VS Code:
   ```bash
   code .
   ```

3. Install dependencies using the VS Code terminal (Ctrl+` to open):
   ```bash
   npm install
   ```

### Step 2: Configure the database

1. Set up a PostgreSQL database on your local machine or use a cloud provider

2. Create a new `.env` file in the root directory with the following content:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/docuai
   OPENAI_API_KEY=your_openai_key
   ANTHROPIC_API_KEY=your_anthropic_key
   PERPLEXITY_API_KEY=your_perplexity_key
   ```
   (Replace credentials with your actual values)

3. Initialize the database with Drizzle:
   ```bash
   npm run db:push
   ```

4. Seed the database with initial data:
   ```bash
   npm run db:seed
   ```

### Step 3: Run the application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open a browser and navigate to http://localhost:5000

### Step 4: VS Code specific settings (optional)

1. Install recommended VS Code extensions:
   - ESLint
   - Prettier
   - Tailwind CSS IntelliSense
   - PostgreSQL (for database connections)

2. Configure VS Code settings for this project:
   - Create `.vscode/settings.json` with:
     ```json
     {
       "editor.formatOnSave": true,
       "editor.defaultFormatter": "esbenp.prettier-vscode",
       "editor.codeActionsOnSave": {
         "source.fixAll.eslint": true
       },
       "typescript.tsdk": "node_modules/typescript/lib"
     }
     ```

### Step 5: Debugging in VS Code

1. Add a launch configuration for Node.js debugging:
   - Create `.vscode/launch.json` with:
     ```json
     {
       "version": "0.2.0",
       "configurations": [
         {
           "type": "node",
           "request": "launch",
           "name": "Launch Program",
           "skipFiles": ["<node_internals>/**"],
           "program": "${workspaceFolder}/server/index.ts",
           "outFiles": ["${workspaceFolder}/**/*.js"],
           "runtimeExecutable": "${workspaceFolder}/node_modules/.bin/tsx",
           "console": "integratedTerminal"
         }
       ]
     }
     ```

2. To debug, click the Run and Debug icon in VS Code's sidebar or press F5

### Troubleshooting in VS Code

1. **Database Connection Issues:**
   - Ensure PostgreSQL is running on your machine
   - Verify your DATABASE_URL is correct in the .env file
   - Try connecting to your database with VS Code's PostgreSQL extension

2. **Node.js Errors:**
   - Make sure you're using Node.js v16 or later: `node --version`
   - Clear node_modules and reinstall if needed:
     ```bash
     rm -rf node_modules
     npm install
     ```

3. **WebSocket Connection Issues:**
   - Check that port 5000 is not in use by another application
   - If WebSocket connections fail, restart the application using:
     ```bash
     npm run dev
     ```

4. **API Key Issues:**
   - Verify that your API keys are valid
   - Test your OpenAI API key with:
     ```bash
     curl https://api.openai.com/v1/chat/completions \
       -H "Content-Type: application/json" \
       -H "Authorization: Bearer YOUR_API_KEY" \
       -d '{
         "model": "gpt-4o",
         "messages": [{"role": "user", "content": "Hello!"}]
       }'
     ```

## Usage

1. **Upload Documents**: Drag and drop PDF documents onto the upload zone
2. **Track Processing**: Monitor real-time processing status on the dashboard
3. **Configure LLM Routing**: Set up rules for routing documents to different AI providers
4. **View Results**: Explore extracted data, including tables, key findings, and summaries
5. **Review History**: Access previously processed documents

## Project Structure

```
├── client                    # Frontend React application
│   ├── src                   # Source files
│   │   ├── components        # UI components
│   │   ├── hooks             # Custom React hooks
│   │   ├── lib               # Utility functions and API clients
│   │   └── pages             # Page components
│   └── index.html            # HTML entry point
├── server                    # Backend Express application
│   ├── llm                   # LLM provider integrations
│   │   ├── anthropic.ts      # Anthropic Claude integration
│   │   ├── llama.ts          # Perplexity/Llama integration
│   │   ├── openai.ts         # OpenAI integration
│   │   └── router.ts         # LLM routing logic
│   ├── document-processor.ts # Document processing logic
│   ├── routes.ts             # Express routes
│   ├── storage.ts            # Database operations
│   └── index.ts              # Server entry point
├── db                        # Database configuration
├── shared                    # Shared code between client and server
│   ├── schema.ts             # Database schema
│   └── types.ts              # TypeScript type definitions
└── uploads                   # Uploaded document storage
```

## LLM Configuration

The system supports intelligent routing of documents to different LLM providers based on document properties:

- **Document Size**: Route larger documents to more capable models
- **Content Type**: Direct financial documents to specialized models
- **Special Requirements**: Configure custom routing rules for specific use cases

## API Endpoints

The backend exposes the following RESTful API endpoints:

### Documents

- **GET /api/documents** - Get all documents
- **GET /api/documents/:id** - Get a specific document by ID
- **POST /api/documents/upload** - Upload new document(s)
- **POST /api/documents/:id/stop** - Stop processing a document
- **POST /api/documents/:id/retry** - Retry processing a failed document

### LLM Configuration

- **GET /api/llm-config** - Get all LLM routing configurations
- **POST /api/llm-config** - Create a new LLM routing configuration
- **DELETE /api/llm-config/:id** - Delete an LLM configuration

### System Statistics

- **GET /api/stats** - Get system-wide statistics

### WebSocket

A WebSocket connection is available at `/ws` for real-time updates:
- Document status changes
- Processing progress updates
- System statistics updates


## Acknowledgments

- Built using Replit
- UI components powered by shadcn/ui
- Icons provided by Lucide


## I Have also uploaded a demonstration video as a file named 
