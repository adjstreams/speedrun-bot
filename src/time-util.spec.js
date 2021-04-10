import {
  calculateSeconds,
  convertToHHMMSS,
  isValidTimeFormat,
} from "./time-util";

describe("calculateSeconds", () => {
  it("Converts HH:MM:SS format correctly", () => {
    const theTime = "01:01:01";
    const expectedSeconds = 3661; // 1hr = 60 mins * 60 seconds (3600) + 1 min (60 seconds) + 1 second
    const result = calculateSeconds(theTime);
    expect(result).toEqual(expectedSeconds);
  });
  it("Converts MM:SS format correctly", () => {
    const theTime = "01:01";
    const expectedSeconds = 61; // 1 min (60 seconds) + 1 second
    const result = calculateSeconds(theTime);
    expect(result).toEqual(expectedSeconds);
  });

  it("returns SS format correctly", () => {
    const theTime = "31";
    const expectedSeconds = 31; // No change
    const result = calculateSeconds(theTime);
    expect(result).toEqual(expectedSeconds);
  });
});

describe("convertToHHMMSS", () => {
  it("Converts seconds to ISO format correctly", () => {
    const theTimeInSeconds = 39;
    const expectedOutput = "00:00:39";
    const result = convertToHHMMSS(theTimeInSeconds);
    expect(result).toEqual(expectedOutput);
  });

  it("Converts seconds over a minute to ISO format correctly", () => {
    const theTimeInSeconds = 61;
    const expectedOutput = "00:01:01";
    const result = convertToHHMMSS(theTimeInSeconds);
    expect(result).toEqual(expectedOutput);
  });

  it("Converts seconds over an hour to ISO format correctly", () => {
    const theTimeInSeconds = 3661;
    const expectedOutput = "01:01:01";
    const result = convertToHHMMSS(theTimeInSeconds);
    expect(result).toEqual(expectedOutput);
  });
});

describe("isValidTimeFormat", () => {
  it("should only accept a string argument", () => {
    const theTime = ["00:34:39", "abbcd"];
    const expectedOutput = false;
    const result = isValidTimeFormat(theTime);
    expect(result).toEqual(expectedOutput);
  });

  it("returns true for HH:MM:SS format", () => {
    const theTime = "00:00:39";
    const expectedOutput = true;
    const result = isValidTimeFormat(theTime);
    expect(result).toEqual(expectedOutput);
  });

  it("returns true for MM:SS format", () => {
    const theTime = "13:39";
    const expectedOutput = true;
    const result = isValidTimeFormat(theTime);
    expect(result).toEqual(expectedOutput);
  });

  it("returns false for SS format", () => {
    const theTime = "39";
    const expectedOutput = false;
    const result = isValidTimeFormat(theTime);
    expect(result).toEqual(expectedOutput);
  });

  it("returns false for other formats like HHMMSS", () => {
    const theTime = "133933";
    const expectedOutput = false;
    const result = isValidTimeFormat(theTime);
    expect(result).toEqual(expectedOutput);
  });

  it("returns false for other text like abcde", () => {
    const theTime = "abcde";
    const expectedOutput = false;
    const result = isValidTimeFormat(theTime);
    expect(result).toEqual(expectedOutput);
  });
});
