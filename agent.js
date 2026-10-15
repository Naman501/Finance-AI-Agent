console.log(process.env.GROQ_API_KEY);

import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function callAgent() {
  const messages = [
    {
      role: "system",
      content:
        "You are Naman, a personal finance assistant. Your task is to assist user with their expenses, balances and financial planning.",
    },
  ];
  messages.push({
    role: "user",
    content: "spent amount this year?",
  });

  while (true) {
    const data = await groq.chat.completions.create({
      messages: messages,
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
                  description: "From date to get the expense",
                },
                to: {
                  type: "string",
                  description: "To date to get the expense",
                },
              },
            },
          },
        },
      ],
    });
    // console.log("hello1", data.choices[0]?.message);

    messages.push(data.choices[0]?.message);
    const toolCalls = data.choices[0]?.message?.tool_calls;

    // console.log("toolCalls=>", toolCalls);
    if (!toolCalls) {
      console.log(`Assistant:${data.choices[0]?.message?.content}`);
      break;
    }

    for (const tool of toolCalls) {
      const functionName = tool.function.name;
      const functionArgs = tool.function.arguments;

      var result = "";
      if (functionName === "getTotalExpense") {
        result = JSON.stringify(getTotalExpense(JSON.parse(functionArgs)));
      }

      messages.push({
        role: "tool",
        content: result,
        tool_call_id: tool.type,
      });

      
    }
    console.log("=======");
    console.log("MESSAGES", messages);
  }
}

callAgent();

// TOOL CALLING

function getTotalExpense({ from, to }) {
  console.log("Calling getTotalExpense tool");
  return 10000;
}
