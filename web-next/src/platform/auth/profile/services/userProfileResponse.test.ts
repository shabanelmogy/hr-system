import { describe, expect, it } from "vitest";
import { parseUserInfoResponse, parseUserPhotoResponse } from "./userProfileResponse";

describe("user profile response parsing", () => {
  it("accepts typed profile data and rejects malformed arrays", () => {
    expect(parseUserInfoResponse({ userName: "admin", roles: ["Admin"] })).toEqual({
      userName: "admin",
      roles: ["Admin"],
    });
    expect(() => parseUserInfoResponse({ roles: "Admin" })).toThrow();
  });

  it("rejects malformed photo payloads", () => {
    expect(parseUserPhotoResponse({ profilePicture: "abc", contentType: "image/png" })).toEqual({
      profilePicture: "abc",
      contentType: "image/png",
    });
    expect(() => parseUserPhotoResponse({ profilePicture: 123 })).toThrow();
  });
});
