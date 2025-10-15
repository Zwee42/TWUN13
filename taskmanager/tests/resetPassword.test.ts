import handler from "@/pages/api/resetPassword";
import { createMocks } from "node-mocks-http";
import bcrypt from "bcryptjs";
import User from "@/models/User";
import dbConnect from "@/lib/mongodb";

// 🧩 Mocka beroenden (vi vill inte ansluta till riktig DB)
jest.mock("@/lib/mongodb");
jest.mock("@/models/User");
jest.mock("bcryptjs");

describe("POST /api/resetPassword", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 405 if not POST", async () => {
    const { req, res } = createMocks({
      method: "GET",
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(405);
  });

  it("should return 400 if token or password is missing", async () => {
    const { req, res } = createMocks({
      method: "POST",
      body: {}, // saknar token och password
    });

    await handler(req, res);

    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Password required");
  });

  it("should return 400 if user not found or token expired", async () => {
    // Mocka så att .findOne().select() kedjan funkar
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(null),
    });

    const { req, res } = createMocks({
      method: "POST",
      body: { token: "invalidtoken", password: "newpassword123" },
    });

    await handler(req, res);

    expect(User.findOne).toHaveBeenCalled();
    expect(res._getStatusCode()).toBe(400);
    expect(res._getData()).toContain("Ogiltig eller utgången token");
  });

  it("should hash new password and reset token", async () => {
    const mockUser = {
      password: "oldhash",
      resetToken: "sometoken",
      resetTokenExpire: Date.now() + 1000 * 60 * 5,
      save: jest.fn(),
    };

    // Mocka så att findOne().select() returnerar mockUser
    (User.findOne as jest.Mock).mockReturnValueOnce({
      select: jest.fn().mockResolvedValueOnce(mockUser),
    });

    // Mocka bcrypt.hash
    (bcrypt.hash as jest.Mock).mockResolvedValueOnce("hashedPassword123");

    const { req, res } = createMocks({
      method: "POST",
      body: { token: "sometoken", password: "newpassword" },
    });

    await handler(req, res);

    // ✅ Kontrollera att hashningen och sparningen skedde korrekt
    expect(bcrypt.hash).toHaveBeenCalledWith("newpassword", 10);
    expect(mockUser.password).toBe("hashedPassword123");
    expect(mockUser.resetToken).toBeNull();
    expect(mockUser.resetTokenExpire).toBeNull();
    expect(mockUser.save).toHaveBeenCalled();

    // ✅ Kontrollera svaret
    expect(res._getStatusCode()).toBe(200);
    expect(res._getData()).toContain("Password has been reset");
  });
});
