import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { authMiddleware } from "../../middleware/auth.middleware";

// Mock de jwt
jest.mock("jsonwebtoken");

describe("Auth Middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Token Validation", () => {
    it("debe retornar 401 si no hay token", async () => {
      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Token no proporcionado. Acceso denegado.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("debe retornar 401 si el header no tiene Bearer", async () => {
      mockRequest.headers = {
        authorization: "Invalid token",
      };

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Token no proporcionado. Acceso denegado.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("debe retornar 401 si el token es inválido", async () => {
      mockRequest.headers = {
        authorization: "Bearer invalid-token",
      };

      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new jwt.JsonWebTokenError("jwt malformed");
      });

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Token inválido. Acceso denegado.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("debe agregar userId y userRol al request si el token es válido", async () => {
      const mockPayload = {
        id: "1",
        correo: "test@test.com",
        rol: "ADMIN",
      };

      mockRequest.headers = {
        authorization: "Bearer valid-token",
      };

      (jwt.verify as jest.Mock).mockReturnValue(mockPayload);

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verify).toHaveBeenCalledWith(
        "valid-token",
        expect.any(String)
      );
      expect(mockRequest.user.id).toBe("1");
      expect(mockRequest.user.rol).toBe("ADMIN");
      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("JWT Verification", () => {
    it("debe verificar el token con el secret correcto", async () => {
      const token = "test-token";
      const secret = "test-secret";

      mockRequest.headers = {
        authorization: `Bearer ${token}`,
      };

      (jwt.verify as jest.Mock).mockReturnValue({
        userId: 1,
        rol: "USER",
      });

      await authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(jwt.verify).toHaveBeenCalledWith(token, expect.any(String));
    });
  });
});
