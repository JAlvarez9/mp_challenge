import request from "supertest";
import express, { Express } from "express";
import { ExpedienteController } from "../../controllers/ExpedienteController";
import { authMiddleware } from "../../middleware/auth.middleware";
import { EstadoExpediente, RolUsuario } from "../../types/enums";

// Mock del ExpedienteService
jest.mock("../../services/ExpedienteService", () => {
  return {
    ExpedienteService: jest.fn().mockImplementation(() => {
      return {
        crear: jest.fn(),
        obtenerTodos: jest.fn(),
        obtenerPorId: jest.fn(),
        actualizar: jest.fn(),
        verificarEsCreador: jest.fn(),
        verificarAcceso: jest.fn(),
      };
    }),
  };
});

// Mock del auth middleware
jest.mock("../../middleware/auth.middleware", () => {
  return {
    authMiddleware: (req: any, res: any, next: any) => {
      req.user = { id: "1", rol: RolUsuario.USER };
      next();
    },
  };
});

describe("ExpedienteController", () => {
  let app: Express;
  let expedienteController: ExpedienteController;
  let mockExpedienteService: any;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    expedienteController = new ExpedienteController();
    mockExpedienteService = (expedienteController as any).expedienteService;

    // Rutas de prueba
    app.post("/expedientes", authMiddleware, expedienteController.crear);
    app.get("/expedientes", authMiddleware, expedienteController.obtenerTodos);
    app.get(
      "/expedientes/:id",
      authMiddleware,
      expedienteController.obtenerPorId
    );
    app.put(
      "/expedientes/:id",
      authMiddleware,
      expedienteController.actualizar
    );

    jest.clearAllMocks();
  });

  describe("POST /expedientes", () => {
    const expedienteData = {
      numeroExpediente: "EXP-2024-001",
      descripcion: "Test expediente",
    };

    it("debe crear un expediente y retornar 201", async () => {
      const mockExpediente = {
        id: 1,
        ...expedienteData,
        estado: EstadoExpediente.BORRADOR,
        creadoPorId: 1,
      };
      mockExpedienteService.crear.mockResolvedValue(mockExpediente);

      const response = await request(app)
        .post("/expedientes")
        .send(expedienteData);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Expediente creado exitosamente");
      expect(response.body.data.expediente).toEqual(mockExpediente);
      expect(mockExpedienteService.crear).toHaveBeenCalledWith(
        expedienteData.numeroExpediente,
        expedienteData.descripcion,
        "1",
        "1"
      );
    });

    it("debe retornar 400 si falta el número de expediente", async () => {
      const response = await request(app)
        .post("/expedientes")
        .send({ descripcion: "Solo descripción" });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "El número de expediente es requerido"
      );
      expect(mockExpedienteService.crear).not.toHaveBeenCalled();
    });

    it("debe retornar 500 si el servicio lanza un error", async () => {
      mockExpedienteService.crear.mockRejectedValue(
        new Error("Error de base de datos")
      );

      const response = await request(app)
        .post("/expedientes")
        .send(expedienteData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Error de base de datos");
    });
  });

  describe("GET /expedientes", () => {
    it("debe retornar lista de expedientes", async () => {
      const mockExpedientes = [
        { id: 1, numero: "EXP-001", estado: EstadoExpediente.BORRADOR },
        { id: 2, numero: "EXP-002", estado: EstadoExpediente.EN_REVISION },
      ];
      mockExpedienteService.obtenerTodos.mockResolvedValue(mockExpedientes);

      const response = await request(app).get("/expedientes");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.expedientes).toEqual(mockExpedientes);
      expect(mockExpedienteService.obtenerTodos).toHaveBeenCalledWith(
        "1",
        "USER"
      );
    });

    it("debe retornar 500 si el servicio falla", async () => {
      mockExpedienteService.obtenerTodos.mockRejectedValue(
        new Error("Error al consultar")
      );

      const response = await request(app).get("/expedientes");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  describe("GET /expedientes/:id", () => {
    it("debe retornar un expediente por ID", async () => {
      const mockExpediente = {
        id: "1",
        numeroExpediente: "EXP-001",
        estado: EstadoExpediente.BORRADOR,
      };
      mockExpedienteService.verificarAcceso.mockResolvedValue(true);
      mockExpedienteService.obtenerPorId.mockResolvedValue(mockExpediente);

      const response = await request(app).get("/expedientes/1");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.expediente).toEqual(mockExpediente);
      expect(mockExpedienteService.verificarAcceso).toHaveBeenCalledWith(
        "1",
        "1",
        "USER"
      );
      expect(mockExpedienteService.obtenerPorId).toHaveBeenCalledWith("1");
    });

    it("debe retornar 404 si el expediente no existe", async () => {
      mockExpedienteService.verificarAcceso.mockResolvedValue(true);
      mockExpedienteService.obtenerPorId.mockResolvedValue(null);

      const response = await request(app).get("/expedientes/999");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Expediente no encontrado");
    });

    it("debe retornar 403 si no tiene acceso al expediente", async () => {
      mockExpedienteService.verificarAcceso.mockResolvedValue(false);

      const response = await request(app).get("/expedientes/1");

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "No tiene permiso para acceder a este expediente"
      );
      expect(mockExpedienteService.obtenerPorId).not.toHaveBeenCalled();
    });
  });

  describe("PUT /expedientes/:id", () => {
    const updateData = {
      descripcion: "Descripción actualizada",
    };

    it("debe actualizar un expediente existente", async () => {
      const mockExpediente = {
        id: 1,
        ...updateData,
        estado: EstadoExpediente.BORRADOR,
      };
      mockExpedienteService.verificarEsCreador.mockResolvedValue(true);
      mockExpedienteService.actualizar.mockResolvedValue(mockExpediente);

      const response = await request(app)
        .put("/expedientes/1")
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Expediente actualizado exitosamente");
      expect(response.body.data.expediente).toEqual(mockExpediente);
    });

    it("debe retornar 403 si el usuario no es el creador", async () => {
      mockExpedienteService.verificarEsCreador.mockResolvedValue(false);

      const response = await request(app)
        .put("/expedientes/1")
        .send(updateData);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Solo el creador del expediente puede editarlo"
      );
      expect(mockExpedienteService.actualizar).not.toHaveBeenCalled();
    });
  });
});
