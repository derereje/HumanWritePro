import { env } from "~/env";
import {
    buildHumanizationSystemMessage,
    buildHumanizationUserMessage,
} from "./aistudios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

interface HumanizeOptions {
    temperature?: number;
    maxTokens?: number;
    preset?: string;
    model?: string;
    isFreeUser?: boolean;
}

export class GroqAdapter {
    constructor() { }

    async humanizeTextStream(
        text: string,
        options: HumanizeOptions = {},
    ): Promise<ReadableStream> {
        const model = options.model ?? "llama-3.3-70b-versatile";
        const systemMessage = buildHumanizationSystemMessage(options.isFreeUser);
        const userMessage = buildHumanizationUserMessage(text);

        console.log(`[Groq Stream] Starting stream with model: ${model}`);

        const response = await fetch(GROQ_API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${env.GROQ_API_KEY}`,
            },
            body: JSON.stringify({
                model,
                messages: [
                    { role: "system", content: systemMessage },
                    { role: "user", content: userMessage },
                ],
                temperature: options.temperature ?? 1.0,
                max_tokens: options.maxTokens ?? 8192,
                stream: true,
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error(`[Groq Stream] Error: ${response.status} ${response.statusText}`, errorBody);
            throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        if (!response.body) throw new Error("No response body from Groq");

        // Groq follows OpenAI SSE format
        return this.transformGroqStreamToFrontendFormat(response.body);
    }

    private transformGroqStreamToFrontendFormat(
        groqStream: ReadableStream<Uint8Array>
    ): ReadableStream {
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();
        let buffer = "";

        return new ReadableStream({
            async start(controller) {
                const reader = groqStream.getReader();

                try {
                    while (true) {
                        const { done, value } = await reader.read();
                        if (done) {
                            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                            break;
                        }

                        buffer += decoder.decode(value, { stream: true });
                        const lines = buffer.split("\n");
                        buffer = lines.pop() || "";

                        for (const line of lines) {
                            const trimmed = line.trim();
                            if (!trimmed || !trimmed.startsWith("data: ")) continue;

                            const data = trimmed.slice(6);
                            if (data === "[DONE]") continue;

                            try {
                                const event = JSON.parse(data);
                                const content = event.choices?.[0]?.delta?.content;

                                if (content) {
                                    const frontendChunk = {
                                        type: "content",
                                        choices: [{
                                            delta: { content },
                                            index: 0,
                                            finish_reason: event.choices?.[0]?.finish_reason || null,
                                        }],
                                    };
                                    controller.enqueue(
                                        encoder.encode(`data: ${JSON.stringify(frontendChunk)}\n\n`)
                                    );
                                }
                            } catch (e) {
                                // Ignore parse errors for partial JSON or keepalive
                            }
                        }
                    }
                } catch (error) {
                    console.error("[Groq Stream] Error processing stream:", error);
                    controller.error(error);
                } finally {
                    reader.releaseLock();
                    controller.close();
                }
            },
        });
    }
}
