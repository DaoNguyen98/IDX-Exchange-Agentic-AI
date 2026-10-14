import { parsePropertyQuery } from "../src/property-parser";

type TestCase = {
  query: string;
  expected: {
    city?: string | null;
    maxPrice?: number | null;
    beds?: number | null;
    baths?: number | null;
    sqft?: number | null;
    type?: string | null;
    pool?: string | null;
    hasView?: string | null;
    maxHoa?: number | null;
  };
};

const testCases: TestCase[] = [
  {
    query: "Show me 3-bedroom condos in Irvine under $1.5M with a pool.",
    expected: {
      city: "Irvine",
      maxPrice: 1500000,
      beds: 3,
      type: "Condominium",
      pool: "True",
    },
  },
  {
    query: "Find 4-bedroom homes in Pasadena under $900k.",
    expected: {
      city: "Pasadena",
      maxPrice: 900000,
      beds: 4,
    },
  },
  {
    query: "Show me townhomes in Anaheim with 2 bathrooms.",
    expected: {
      city: "Anaheim",
      baths: 2,
      type: "Townhouse",
    },
  },
  {
    query: "Find condos in Newport Beach with a view.",
    expected: {
      city: "Newport Beach",
      type: "Condominium",
      hasView: "True",
    },
  },
  {
    query: "Show me single family homes in Riverside under $750000.",
    expected: {
      city: "Riverside",
      maxPrice: 750000,
      type: "SingleFamilyResidence",
    },
  },
  {
    query: "Find land in Temecula under $500k.",
    expected: {
      city: "Temecula",
      maxPrice: 500000,
      type: "UnimprovedLand",
    },
  },
  {
    query: "Show me 2-bedroom condos in Irvine with HOA under $500.",
    expected: {
      city: "Irvine",
      beds: 2,
      type: "Condominium",
      maxHoa: 500,
    },
  },
  {
    query: "Find 1800 sqft homes in Corona under $800k.",
    expected: {
      city: "Corona",
      sqft: 1800,
      maxPrice: 800000,
    },
  },
  {
    query: "Show me 3-bedroom 2.5-bath condos in Irvine.",
    expected: {
      city: "Irvine",
      beds: 3,
      baths: 2.5,
      type: "Condominium",
    },
  },
  {
    query: "Find townhouses in Long Beach with a pool and a view.",
    expected: {
      city: "Long Beach",
      type: "Townhouse",
      pool: "True",
      hasView: "True",
    },
  },
];

async function runTests() {
  let passed = 0;

  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    const result = await parsePropertyQuery(test.query);

    let success = true;

    for (const [key, value] of Object.entries(test.expected)) {
      if (result[key as keyof typeof result] !== value) {
        success = false;
      }
    }

    console.log(`Test ${i + 1}: ${success ? "PASS" : "FAIL"}`);
    console.log(`Query: ${test.query}`);
    console.log("Result:", result);
    console.log("Expected:", test.expected);
    console.log("----------------------------------");

    if (success) {
      passed++;
    }
  }

  console.log(`Passed ${passed}/${testCases.length} tests.`);
}

runTests();