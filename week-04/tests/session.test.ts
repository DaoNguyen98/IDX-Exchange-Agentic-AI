import {
  getSession,
  updateSession,
  clearSession,
} from "../src/session";

const userId = "test-user";

console.log("Initial session:");
console.log(getSession(userId));

updateSession(userId, {
  city: "Irvine",
  maxPrice: 1200000,
});

console.log("\nAfter first update:");
console.log(getSession(userId));

updateSession(userId, {
  beds: 3,
  type: "SingleFamilyResidence",
});

console.log("\nAfter second update:");
console.log(getSession(userId));

clearSession(userId);

console.log("\nAfter clear:");
console.log(getSession(userId));