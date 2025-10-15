import handler from "@/pages/api/forgotPassword";
import { createMocks } from "node-mocks-http";
import User from "@/models/User";
import crypto from "crypto";
import { sendResetEmail } from "@/lib/nodemailer";
import type { NextApiRequest, NextApiResponse } from "next";

// Mocka beroenden
jest.mock("@/models/User");
jest.mock("@/lib/nodemailer");
jest.mock("@/lib/mongodb", () => jest.fn());

describe("POST /api/forgotPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mocka crypto.randomBytes så att token blir "abc123"
    jest.spyOn(crypto, "randomBytes").mockImplementation(() => ({
      toString: () => "abc123",
    }));
  });

  it("should return 405 if not POST", async () => {
    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "GET",
    });
    await handler(req, res);
    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 404 if user not found", async () => {
    (User.findOne as jest.Mock).mockResolvedValue(null);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "missing@example.com" },
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(404);
    expect(res._getData()).toContain("User not found");
  });

  it("should save token and send reset email when user exists", async () => {
    const mockUser = {
      email: "test@example.com",
      resetToken: null,
      resetTokenExpire: null,
      save: jest.fn().mockResolvedValue(true),
    };

    (User.findOne as jest.Mock).mockResolvedValue(mockUser);
    (sendResetEmail as jest.Mock).mockResolvedValue(true);

    const { req, res } = createMocks<NextApiRequest, NextApiResponse>({
      method: "POST",
      body: { email: "test@example.com" },
    });

    await handler(req, res);

    expect(mockUser.save).toHaveBeenCalled();
    expect(sendResetEmail).toHaveBeenCalledWith(
      "test@example.com",
      expect.stringContaining("/resetPassword?token=")
    );
    expect(mockUser.resetToken).toBe("abc123"); // ✅ token är nu korrekt
    expect(mockUser.resetTokenExpire).toBeGreaterThan(Date.now());
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain("Reset link sent to your email");
  });
});
