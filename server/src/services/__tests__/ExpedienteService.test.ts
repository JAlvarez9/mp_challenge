import { ExpedienteService } from "../../services/ExpedienteService";
import { EstadoExpediente } from "../../types/enums";

// Mock del ExpedienteRepository
jest.mock("../../repositories/ExpedienteRepository", () => {
  return {
    ExpedienteRepository: jest.fn().mockImplementation(() => {
      return {
        crear: jest.fn(),
        actualizar: jest.fn(),
        obtenerPorId: jest.fn(),
        obtenerTodos: jest.fn(),
        cambiarEstado: jest.fn(),
        eliminar: jest.fn(),
      };
    }),
  };
});

describe("ExpedienteService", () => {
  let expedienteService: ExpedienteService;
  let mockExpedienteRepository: any;

  beforeEach(() => {
    expedienteService = new ExpedienteService();
    mockExpedienteRepository = (expedienteService as any).expedienteRepository;
    jest.clearAllMocks();
  });

  describe("crear", () => {
    it("debe crear un expediente con estado BORRADOR", async () => {
      const numeroExpediente = "EXP-2024-001";
      const descripcion = "Descripción del expediente";
      const usuarioId = "1";
      const expectedExpediente = {
        id: "1",
        numeroExpediente,
        descripcion,
        estado: EstadoExpediente.BORRADOR,
        usuarioRegistroId: usuarioId,
      };
      mockExpedienteRepository.crear.mockResolvedValue(expectedExpediente);

      const result = await expedienteService.crear(
        numeroExpediente,
        descripcion,
        usuarioId,
        usuarioId
      );

      expect(mockExpedienteRepository.crear).toHaveBeenCalledWith({
        numeroExpediente,
        descripcion,
        usuarioRegistroId: usuarioId,
        createdBy: usuarioId,
      });
      expect(result).toEqual(expectedExpediente);
      expect(result.estado).toBe(EstadoExpediente.BORRADOR);
    });

    it("debe pasar el userId del creador al repositorio", async () => {
      mockExpedienteRepository.crear.mockResolvedValue({});
      const userId = "42";
      const numeroExpediente = "EXP-001";

      await expedienteService.crear(numeroExpediente, "desc", userId, userId);

      expect(mockExpedienteRepository.crear).toHaveBeenCalledWith({
        numeroExpediente,
        descripcion: "desc",
        usuarioRegistroId: userId,
        createdBy: userId,
      });
    });
  });

  describe("actualizar", () => {
    it("debe actualizar un expediente existente", async () => {
      const expedienteId = "1";
      const descripcion = "Nueva descripción";
      const usuarioActual = "1";
      const updatedExpediente = {
        id: expedienteId,
        descripcion,
        estado: EstadoExpediente.BORRADOR,
      };
      mockExpedienteRepository.actualizar.mockResolvedValue(updatedExpediente);

      const result = await expedienteService.actualizar(
        expedienteId,
        descripcion,
        usuarioActual
      );

      expect(mockExpedienteRepository.actualizar).toHaveBeenCalledWith(
        expedienteId,
        {
          descripcion,
          updatedBy: usuarioActual,
        }
      );
      expect(result).toEqual(updatedExpediente);
    });

    it("debe permitir descripción undefined", async () => {
      const expedienteId = "1";
      const usuarioActual = "1";
      mockExpedienteRepository.actualizar.mockResolvedValue({});

      await expedienteService.actualizar(
        expedienteId,
        undefined,
        usuarioActual
      );

      expect(mockExpedienteRepository.actualizar).toHaveBeenCalledWith(
        expedienteId,
        {
          descripcion: undefined,
          updatedBy: usuarioActual,
        }
      );
    });
  });

  describe("verificarEsCreador", () => {
    it("debe retornar true si el usuario es el creador", async () => {
      const mockExpediente = {
        id: "1",
        usuarioRegistroId: "1",
        numeroExpediente: "EXP-001",
      };
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(mockExpediente);

      const result = await expedienteService.verificarEsCreador("1", "1");

      expect(mockExpedienteRepository.obtenerPorId).toHaveBeenCalledWith("1");
      expect(result).toBe(true);
    });

    it("debe retornar false si el usuario no es el creador", async () => {
      const mockExpediente = {
        id: "1",
        usuarioRegistroId: "1",
        numeroExpediente: "EXP-001",
      };
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(mockExpediente);

      const result = await expedienteService.verificarEsCreador("1", "2");

      expect(result).toBe(false);
    });

    it("debe retornar false si el expediente no existe", async () => {
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(null);

      const result = await expedienteService.verificarEsCreador("999", "1");

      expect(result).toBe(false);
    });
  });

  describe("obtenerPorId", () => {
    it("debe retornar un expediente por su ID", async () => {
      const mockExpediente = {
        id: "1",
        numeroExpediente: "EXP-2024-001",
        descripcion: "Test",
        estado: EstadoExpediente.BORRADOR,
      };
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(mockExpediente);

      const result = await expedienteService.obtenerPorId("1");

      expect(mockExpedienteRepository.obtenerPorId).toHaveBeenCalledWith("1");
      expect(result).toEqual(mockExpediente);
    });

    it("debe retornar null si el expediente no existe", async () => {
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(null);

      const result = await expedienteService.obtenerPorId("999");

      expect(result).toBeNull();
    });
  });

  describe("obtenerTodos", () => {
    it("debe retornar lista de expedientes para ADMIN", async () => {
      const mockExpedientes = [
        {
          id: "1",
          numeroExpediente: "EXP-001",
          estado: EstadoExpediente.BORRADOR,
        },
        {
          id: "2",
          numeroExpediente: "EXP-002",
          estado: EstadoExpediente.EN_REVISION,
        },
      ];
      mockExpedienteRepository.obtenerTodos.mockResolvedValue(mockExpedientes);

      const result = await expedienteService.obtenerTodos("1", "ADMIN");

      expect(mockExpedienteRepository.obtenerTodos).toHaveBeenCalledWith(
        "1",
        false
      );
      expect(result).toEqual(mockExpedientes);
    });

    it("debe retornar solo expedientes del usuario si es USER", async () => {
      const mockExpedientes = [{ id: "1", numeroExpediente: "EXP-001" }];
      mockExpedienteRepository.obtenerTodos.mockResolvedValue(mockExpedientes);

      const result = await expedienteService.obtenerTodos("1", "USER");

      expect(mockExpedienteRepository.obtenerTodos).toHaveBeenCalledWith(
        "1",
        true
      );
      expect(result).toHaveLength(1);
    });
  });

  describe("enviarARevision", () => {
    it("debe cambiar el estado a EN_REVISION", async () => {
      const expedienteId = "1";
      const usuarioActual = "1";
      const updatedExpediente = {
        id: expedienteId,
        estado: EstadoExpediente.EN_REVISION,
      };

      mockExpedienteRepository.cambiarEstado.mockResolvedValue(
        updatedExpediente
      );

      const result = await expedienteService.enviarARevision(
        expedienteId,
        usuarioActual
      );

      expect(mockExpedienteRepository.cambiarEstado).toHaveBeenCalledWith(
        expedienteId,
        EstadoExpediente.EN_REVISION,
        usuarioActual
      );
      expect(result.estado).toBe(EstadoExpediente.EN_REVISION);
    });
  });

  describe("verificarAcceso", () => {
    it("debe retornar true para ADMIN", async () => {
      const mockExpediente = {
        id: "1",
        usuarioRegistroId: "2",
      };
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(mockExpediente);

      const result = await expedienteService.verificarAcceso("1", "1", "ADMIN");

      expect(result).toBe(true);
    });

    it("debe retornar true si USER es el creador", async () => {
      const mockExpediente = {
        id: "1",
        usuarioRegistroId: "1",
      };
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(mockExpediente);

      const result = await expedienteService.verificarAcceso("1", "1", "USER");

      expect(result).toBe(true);
    });

    it("debe retornar false si USER no es el creador", async () => {
      const mockExpediente = {
        id: "1",
        usuarioRegistroId: "2",
      };
      mockExpedienteRepository.obtenerPorId.mockResolvedValue(mockExpediente);

      const result = await expedienteService.verificarAcceso("1", "1", "USER");

      expect(result).toBe(false);
    });
  });
});
