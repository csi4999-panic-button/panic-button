"use strict";

const util = require("../src/server/util");

describe("Utils", () => {
  it("should generate a random key with the specified length", () => {
    const key1 = util.getKey(32);
    const key2 = util.getKey(16);

    expect(key1.length).to.equal(44);
    expect(key2.length).to.equal(24);
  });

  it("should generate a random key with the specified length asynchronously", async () => {
    const key1 = await util.getKeyAsync(32);
    const key2 = await util.getKeyAsync(16);

    expect(key1.length).to.equal(44);
    expect(key2.length).to.equal(24);
  });

  it("should generate a random key with the specified length asynchronously (callback)", async () => {
    util.getKeyAsync(32, (err, buffer) => {
      expect(buffer.length).to.equal(44);
    });

    const key2 = util.getKeyAsync(16, (err, buffer) => {
      expect(buffer.length).to.equal(24);
    });
  });
});
