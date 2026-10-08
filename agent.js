console.log(process.env.GROQ_API_KEY);

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function callAgent() {
  const data = await groq.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          "You are Naman, a personal finance assistant. Your task is to assist user with their expenses, balances and financial planning.",
      },
      {
        role: "user",
        content: "spending this year?",
      },
    ],
    model: "openai/gpt-oss-120b",
    tools: [
      {
        type: "function",
        function: {
          name: "getTotalExpense",
          description: "Get a total expense from date to date",
          parameters: {
            type: "object",
            properties: {
              from: {
                type: "string",
                desccription: "From date to get the expense",
              },
              to: {
                type: "string",
                desccription: "To date to get the expense",
              },
            },
          },
        },
      },
    ],
  });
  console.log("hello1",data.choices[0]?.message);
  console.log("hello2", JSON.stringify(data.choices[0]?.message?.tool_calls || "no tool calling is happening"));
}

callAgent();

// TOOL CALLING

function getTotalExpense({ from, to }) {
  console.log("Calling getTotalExpense tool");
  return 10000;
}
