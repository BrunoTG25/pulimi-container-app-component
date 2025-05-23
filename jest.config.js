module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.ts"],
  coverageDirectory: "coverage",
  collectCoverageFrom: ["component/**/*.ts"]
};
