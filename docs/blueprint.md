# **App Name**: AIAgentChat

## Core Features:

- AI Tool Selection: Allow the user to select the AI tool (GPT, Gemini, Purplexcity, Grok, Deepseek, FreeTool) to use for generating responses.
- User Input: Provide a textarea for the user to input their prompt text.
- Message Submission: Enable users to send their messages to the selected AI tool.
- AI Response Handling: Forward the user's input to the selected AI provider via the .NET backend, and display the provider's raw and parsed responses.
- AI provider selection tool: LLM decides when or if it should switch from a higher-end provider like GPT to a lower-cost provider such as FreeTool. The tool should be cost-sensitive by default, but offer some ways to override its choices based on latency or quality requirements.
- Chat History: Store the conversation history (user input and AI responses) in Firestore, and display it in the chat pane.
- Data Logging: Logs user prompts, model selection and raw output to a database with user IDs for data provenance and future analytics (note: take care to keep personal data masked)

## Style Guidelines:

- Primary color: Slate Blue (#7B68EE) to evoke a sense of calm and intelligence.
- Background color: Light Gray (#F0F0F0) to provide a neutral backdrop and reduce eye strain.
- Accent color: Orange (#FF7F50) to highlight key elements like the send button and AI responses, creating a visual contrast.
- Body and headline font: 'Inter', a grotesque-style sans-serif, will be used for a clean, modern aesthetic.
- Code font: 'Source Code Pro' for displaying the raw JSON response from the AI provider.
- Use minimalist icons to represent different AI tools in the selection dropdown.
- Employ a clean, single-page layout with the chat pane taking up most of the screen, and input elements located at the bottom.