
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Create interface for reading user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Function to prompt user
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Compound interest calculation function
function calculateCompoundInterest(principal, rate, time, frequency) {
  // A = P(1 + r/n)^(nt)
  const amount = principal * Math.pow(1 + rate / (100 * frequency), frequency * time);
  const interest = amount - principal;
  return {
    principal,
    rate,
    time,
    frequency,
    finalAmount: parseFloat(amount.toFixed(2)),
    totalInterest: parseFloat(interest.toFixed(2)),
  };
}

// Tool functions for Claude
const tools = [
  {
    name: "calculate_compound_interest",
    description:
      "Calculates compound interest for an investment given principal, annual rate, time period, and compounding frequency",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "Initial investment amount in dollars",
        },
        annual_rate: {
          type: "number",
          description: "Annual interest rate as a percentage (e.g., 5 for 5%)",
        },
        years: {
          type: "number",
          description: "Investment time period in years",
        },
        compounding_frequency: {
          type: "integer",
          description:
            "How many times per year interest is compounded (1=annually, 2=semi-annually, 4=quarterly, 12=monthly, 365=daily)",
        },
      },
      required: ["principal", "annual_rate", "years", "compounding_frequency"],
    },
  },
  {
    name: "compare_investments",
    description:
      "Compares two investment scenarios with different parameters to show which yields better returns",
    input_schema: {
      type: "object",
      properties: {
        investment1: {
          type: "object",
          properties: {
            principal: { type: "number" },
            annual_rate: { type: "number" },
            years: { type: "number" },
            compounding_frequency: { type: "integer" },
            name: { type: "string" },
          },
          required: ["principal", "annual_rate", "years", "compounding_frequency", "name"],
        },
        investment2: {
          type: "object",
          properties: {
            principal: { type: "number" },
            annual_rate: { type: "number" },
            years: { type: "number" },
            compounding_frequency: { type: "integer" },
            name: { type: "string" },
          },
          required: ["principal", "annual_rate", "years", "compounding_frequency", "name"],
        },
      },
      required: ["investment1", "investment2"],
    },
  },
  {
    name: "analyze_investment_growth",
    description:
      "Analyzes and visualizes how an investment grows over time with yearly breakdown",
    input_schema: {
      type: "object",
      properties: {
        principal: {
          type: "number",
          description: "Initial investment amount in dollars",
        },
        annual_rate: {
          type: "number",
          description: "Annual interest rate as a percentage",
        },
        years: {
          type: "number",
          description: "Investment time period in years",
        },
        compounding_frequency: {
          type: "integer",
          description: "How many times per year interest is compounded",
        },
      },
      required: ["principal", "annual_rate", "years", "compounding_frequency"],
    },
  },
];

// Process tool calls
function processToolCall(toolName, toolInput) {
  if (toolName === "calculate_compound_interest") {
    const result = calculateCompoundInterest(
      toolInput.principal,
      toolInput.annual_rate,
      toolInput.years,
      toolInput.compounding_frequency
    );
    return JSON.stringify(result);
  }

  if (toolName === "compare_investments") {
    const result1 = calculateCompoundInterest(
      toolInput.investment1.principal,
      toolInput.investment1.annual_rate,
      toolInput.investment1.years,
      toolInput.investment1.compounding_frequency
    );
    const result2 = calculateCompoundInterest(
      toolInput.investment2.principal,
      toolInput.investment2.annual_rate,
      toolInput.investment2.years,
      toolInput.investment2.compounding_frequency
    );

    const comparison = {
      investment1: {
        name: toolInput.investment1.name,
        ...result1,
      },
      investment2: {
        name: toolInput.investment2.name,
        ...result2,
      },
      winner: result1.finalAmount > result2.finalAmount ? toolInput.investment1.name : toolInput.investment2.name,
      difference: Math.abs(result1.finalAmount - result2.finalAmount),
    };
    return JSON.stringify(comparison);
  }

  if (toolName === "analyze_investment_growth") {
    const yearlyData = [];
    for (let year = 1; year <= toolInput.years; year++) {
      const yearlyResult = calculateCompoundInterest(
        toolInput.principal,
        toolInput.annual_rate,
        year,
        toolInput.compounding_frequency
      );
      yearlyData.push({
        year,
        amount: yearlyResult.finalAmount,
        interest_earned: yearlyResult.totalInterest,
      });
    }
    return JSON.stringify(yearlyData