import { Request, Response, NextFunction } from "express";
import { roleMiddleware } from "../../middleware/role.middleware";
import { RolUsuario } from "../../types/enums";

describe("Role Middleware", () => {
  let mockRequest: any;
  let mockResponse: any;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Role Authorization", () => {
    it("debe retornar 401 si no hay rol en el request", () => {
      const middleware = roleMiddleware(RolUsuario.ADMIN);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "Usuario no autenticado.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("debe retornar 403 si el usuario no tiene el rol permitido", () => {
      mockRequest.user = { rol: RolUsuario.USER };
      const middleware = roleMiddleware(RolUsuario.ADMIN);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: "No tienes permisos para acceder a este recurso.",
      });
      expect(nextFunction).not.toHaveBeenCalled();
    });

    it("debe permitir acceso si el usuario tiene el rol correcto", () => {
      mockRequest.user = { rol: RolUsuario.ADMIN };
      const middleware = roleMiddleware(RolUsuario.ADMIN);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("debe permitir acceso con múltiples roles permitidos", () => {
      mockRequest.user = { rol: RolUsuario.MODERADOR };
      const middleware = roleMiddleware(RolUsuario.ADMIN, RolUsuario.MODERADOR);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("debe rechazar si el rol no está en la lista de permitidos", () => {
      mockRequest.user = { rol: RolUsuario.USER };
      const middleware = roleMiddleware(RolUsuario.ADMIN, RolUsuario.MODERADOR);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(nextFunction).not.toHaveBeenCalled();
    });
  });

  describe("Role Types", () => {
    it("debe funcionar con rol ADMIN", () => {
      mockRequest.user = { rol: RolUsuario.ADMIN };
      const middleware = roleMiddleware(RolUsuario.ADMIN);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it("debe funcionar con rol USER", () => {
      mockRequest.user = { rol: RolUsuario.USER };
      const middleware = roleMiddleware(RolUsuario.USER);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });

    it("debe funcionar con rol MODERADOR", () => {
      mockRequest.user = { rol: RolUsuario.MODERADOR };
      const middleware = roleMiddleware(RolUsuario.MODERADOR);

      middleware(
        mockRequest as Request,
        mockResponse as Response,
        nextFunction
      );

      expect(nextFunction).toHaveBeenCalled();
    });
  });
});
