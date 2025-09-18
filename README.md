# AI Agent Chat

This is a proof-of-concept application for an AI Agent Chat interface built with Next.js and Genkit. It allows users to interact with multiple AI models from different providers through a unified chat interface.

## Features

- **Multi-Provider Support**: Connect to various AI services like Gemini, Ollama, OpenRouter, and Cohere.
- **Dynamic Tool Selection**: An "Auto-select" feature uses a meta-model to choose the most appropriate AI tool for a given query.
- **Local Model Integration**: Supports connecting to a local Ollama server to run models on your own machine.
- **Secure API Key Management**: API keys are stored securely in the browser's local storage and are never exposed on the client-side.
- **Persistent Chat History**: Conversations are saved locally per user, allowing you to continue where you left off.
- **User Authentication**: A simple, local-storage-based user authentication system to simulate a multi-user environment.
- **Responsive UI**: Built with ShadCN UI and Tailwind CSS for a clean and responsive user experience.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **AI/ML**: [Genkit](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://reactjs.org/), [ShadCN UI](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Icons**: [Lucide React](https://lucide.dev/guide/packages/lucide-react)

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd <repository-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

### Running the Application

1.  **Start the development server:**
    The application uses Next.js with Turbopack for fast development.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

2.  **Run the Genkit development server (optional):**
    To inspect Genkit flows, traces, and logs, you can run the Genkit developer UI in a separate terminal.
    ```bash
    npm run genkit:watch
    ```
    The Genkit UI will be available at `http://localhost:4000`.

### Configuration

1.  **Set up API Keys:**
    - On first launch, the application will redirect you to the `/settings` page.
    - Add your API keys for the desired AI providers (e.g., Gemini, OpenRouter, Cohere). These keys are stored only in your browser's local storage.
    - For `Ollama`, an API key is optional if your local server is unsecured.

2.  **Configure Ollama Host (if needed):**
    - If your Ollama server is not running on the default `http://localhost:11434`, you can specify the correct host URL in the settings page.
    - **Note:** If the application is running in a container, `localhost` will not work. You must use your machine's local network IP address (e.g., `http://192.168.1.5:11434`).
