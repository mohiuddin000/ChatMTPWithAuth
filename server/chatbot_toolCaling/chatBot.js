import Groq from "groq-sdk";
import { tavily } from "@tavily/core";
import NodeCache from "node-cache";

//const { tavily } = require("@tavily/core");

const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY });

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const cache = new NodeCache({ stdTTL: 60 * 60 * 24 }); //cache for 24 hours

export async function generate(userMessage, threadId) {
    const baseMessages = [
        {
            role: "system",
            content: `You are Jarvis, a smart personal assistant who answers the asked question.
            Use the webSearch tool to search the web for relevant information when needed.
            Always respond in a helpful and accurate manner.
            Current date and time: ${new Date().toUTCString()}`,
        },
        // {
        //     role: "user",
        //     content: "hi ",
        //     //"when was iphone 16 launched?
        // },
    ];

    const messages = cache.get(threadId) ?? baseMessages;

    messages.push({
        role: "user",
        content: userMessage,
    });

    const MAX_RETRIES = 10;
    let count = 0;

    while (true) {
        if (count >= MAX_RETRIES) {
            return "Sorry, I'm unable to process your request at the moment. Please try again.";
        }
        count++;

        const complition = await groq.chat.completions.create({
            temperature: 0,
            model: "llama-3.3-70b-versatile",
            messages: messages,
            tools: [
                {
                    type: "function",
                    function: {
                        name: "webSearch",
                        description:
                            "Useful for when you need to answer questions about current events or the current state of the world. Use this to search the web for relevant information.",
                        parameters: {
                            type: "object",
                            properties: {
                                query: {
                                    type: "string",
                                    description:
                                        "the search query to perform search on web",
                                },
                            },
                            required: ["query"],
                        },
                    },
                },
            ],
            tool_choice: "auto",
        });

        messages.push(complition.choices[0].message);

        const toolCalls = complition.choices[0].message.tool_calls;

        if (!toolCalls) {
            //final answer

            cache.set(threadId, messages);

            return complition.choices[0].message.content;
        }

        for (const tool of toolCalls) {
            // console.log("tool call:", tool);

            const functionName = tool.function.name;
            const functionParams = tool.function.arguments;

            if (functionName === "webSearch") {
                const toolResult = await webSearch(JSON.parse(functionParams));
                // console.log("tool result:", toolResult);
                // console.log("yaha aaya");
                messages.push({
                    tool_call_id: tool.id,
                    role: "tool",
                    name: functionName,
                    content: toolResult,
                });
            }
        }

        //  console.log("messages before final call:", messages);
    }
}

async function webSearch({ query }) {
    console.log("calling web search....");

    const response = await tvly.search(query);
    // console.log("web search response:", response);

    const finalResult =
        response.results[0]?.content || "No relevant information found.";

    // console.log("final result:", finalResult);
    return finalResult;
    // return "iphone 16 was launched on 16 september 2024";
}
