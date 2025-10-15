// __tests__/logout.test.ts
import handler from "../pages/api/logout"; // adjust the path
import type { NextApiRequest, NextApiResponse } from "next";

// helper to create mock req/res objects
function createMocks(method: string = "POST") {
  const req = {
    method,
    headers: {},
  } as unknown as NextApiRequest;

  const res = {
    statusCode: 0,
    headers: {} as Record<string, string>,
    setHeader: jest.fn(function (key: string, value: string) {
      this.headers[key] = value;
    }),
    status: jest.fn(function (code: number) {
      this.statusCode = code;
      return this;
    }),
    json: jest.fn(function (data) {
      return data;
    }),
  } as unknown as NextApiResponse;

  return { req, res };
}

describe("Logout API", () => {
  it("should clear auth cookie and return success message", async () => {
    const { req, res } = createMocks("POST");

    await handler(req, res);

    expect(res.setHeader).toHaveBeenCalledWith(
      "Set-Cookie",
      expect.stringContaining("auth_token=")
    );

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: "Logged out successfully",
    });
  });
});
