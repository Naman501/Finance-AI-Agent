console.log("GROQ-KEY: ",process.env.GROQ_API_KEY);

import Groq from "groq-sdk";
import readline from "readline/promises";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const expenseDB = [];

export async function callAgent() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const messages = [
    {
      role: "system",
      content:
        "You are Naman, a personal finance assistant. Your task is to assist user with their expenses, balances and financial planning.",
    },
  ];
  // messages.push({
  //   role: "user",
  //   content: "Hey i just bought new iPhone worth 125000",
  // });

  //user prmopt loop
  while (true) {
    const question = await rl.question("USER: ");

    if (question === "bye") {
      console.log("Bye  Bye MAALIK!");
      break;
    }

    messages.push({
      role: "user",
      content: question,
    });

    // agent prmopt loop
    while (true) {
      const data = await groq.chat.completions.create({
        messages: messages,
        model: "openai/gpt-oss-120b",
        temperature: 2,
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
          {
            type: "function",
            function: {
              name: "addExpense",
              description: "Adding expense amount with name of purchase",
              parameters: {
                type: "object",
                properties: {
                  name: {
                    type: "string",
                    description: "Name of the expense",
                  },
                  amount: {
                    type: "string",
                    description: "Amount spent for the expense",
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
        console.log(`Final=>Assistant:${data.choices[0]?.message?.content}`);
        break;
      }

      for (const tool of toolCalls) {
        const functionName = tool.function.name;
        const functionArgs = tool.function.arguments;

        var result = "";
        if (functionName === "getTotalExpense") {
          result = getTotalExpense(JSON.parse(functionArgs));
        } else if (functionName === "addExpense") {
          result = addExpense(JSON.parse(functionArgs));
        }

        messages.push({
          role: "tool",
          content: result,
          tool_call_id: tool.type,
        });
      }
    }
  }
  rl.close();
}

callAgent();

// TOOL CALLING

function getTotalExpense({ from, to }) {
  console.log("Calling getTotalExpense tool");
  const expense = expenseDB.reduce((acc, item) => {
    return acc + item.amount;
  }, 0);
  return `${expense} INR`;
}

function addExpense({ name, amount }) {
  console.log("Calling addExpense tool");
  console.log(`Adding ${amount} to ExpenseDB for purchse of ${name}`);
  expenseDB.push({ name, amount });
  return `Added to DB `;
}
