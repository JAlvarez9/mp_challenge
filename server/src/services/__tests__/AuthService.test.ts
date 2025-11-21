import { AuthService } from '../../services/AuthService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Mocks
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

// Mock del UsuarioRepository
jest.mock('../../repositories/UsuarioRepository', () => {
  return {
    UsuarioRepository: jest.fn().mockImplementation(() => {
      return {
        obtenerPorCorreo: jest.fn(),
        crear: jest.fn(),
      };
    }),
  };
});

describe('AuthService', () => {
  let authService: AuthService;
  let mockUsuarioRepository: any;

  beforeEach(() => {
    authService = new AuthService();
    mockUsuarioRepository = (authService as any).usuarioRepository;
    process.env.JWT_SECRET = 'test-secret';
    jest.clearAllMocks();
  });

  describe('login', () => {
    const mockUsuario = {
      id: '1',
      correo: 'test@test.com',
      password: 'hashedPassword123',
      nombre: 'Test User',
      rol: 'USER',
      isActive: true,
    };

    it('debe retornar token y usuario si las credenciales son correctas', async () => {
      mockUsuarioRepository.obtenerPorCorreo.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');

      const result = await authService.login('test@test.com', 'password123');

      expect(mockUsuarioRepository.obtenerPorCorreo).toHaveBeenCalledWith(
        'test@test.com'
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(
        'password123',
        'hashedPassword123'
      );
      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '1', correo: 'test@test.com', rol: 'USER' },
        expect.any(String),
        { expiresIn: '24h' }
      );
      expect(result.token).toBe('test-token');
      expect(result.usuario.correo).toBe('test@test.com');
    });

    it('debe lanzar error si el usuario no existe', async () => {
      mockUsuarioRepository.obtenerPorCorreo.mockResolvedValue(null);

      await expect(
        authService.login('noexiste@test.com', 'password123')
      ).rejects.toThrow('Credenciales inválidas');

      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('debe lanzar error si la contraseña es incorrecta', async () => {
      mockUsuarioRepository.obtenerPorCorreo.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.login('test@test.com', 'wrongpassword')
      ).rejects.toThrow('Credenciales inválidas');

      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('debe lanzar error si el usuario está inactivo', async () => {
      const inactiveUser = { ...mockUsuario, isActive: false };
      mockUsuarioRepository.obtenerPorCorreo.mockResolvedValue(inactiveUser);

      await expect(
        authService.login('test@test.com', 'password123')
      ).rejects.toThrow('Usuario inactivo');

      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('registrar', () => {
    const registerData = {
      nombre: 'New User',
      email: 'newuser@test.com',
      password: 'password123',
      rol: 'USER',
    };

    it('debe crear un usuario con contraseña hasheada', async () => {
      const hashedPassword = 'hashedPassword123';
      const salt = 'test-salt';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');
      
      const createdUser = {
        id: '1',
        nombre: registerData.nombre,
        correo: registerData.email,
        password: hashedPassword,
        rol: registerData.rol,
        isActive: true,
      };
      mockUsuarioRepository.crear.mockResolvedValue(createdUser);

      const result = await authService.registrar(
        registerData.nombre,
        registerData.email,
        registerData.password,
        registerData.rol as any
      );

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, salt);
      expect(mockUsuarioRepository.crear).toHaveBeenCalledWith({
        nombre: registerData.nombre,
        correo: registerData.email,
        password: hashedPassword,
        rol: registerData.rol,
        createdBy: registerData.email,
      });
      expect(result.token).toBe('test-token');
      expect(result.usuario).toEqual(createdUser);
    });

    it('debe usar genSalt para crear el hash', async () => {
      const salt = 'test-salt';
      const hashedPassword = 'hashedPassword123';
      (bcrypt.genSalt as jest.Mock).mockResolvedValue(salt);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      (jwt.sign as jest.Mock).mockReturnValue('token');
      mockUsuarioRepository.crear.mockResolvedValue({
        id: '1',
        nombre: registerData.nombre,
        correo: registerData.email,
        rol: registerData.rol,
        password: hashedPassword,
        isActive: true,
      });

      await authService.registrar(
        registerData.nombre,
        registerData.email,
        registerData.password,
        registerData.rol as any
      );

      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith(registerData.password, salt);
    });

  });

  describe('Token Generation', () => {
    it('debe generar token con expiración de 24h', async () => {
      const mockUsuario = {
        id: '1',
        correo: 'test@test.com',
        password: 'hashedPassword',
        nombre: 'Test',
        rol: 'ADMIN',
        isActive: true,
      };

      mockUsuarioRepository.obtenerPorCorreo.mockResolvedValue(mockUsuario);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('token');

      await authService.login('test@test.com', 'password');

      expect(jwt.sign).toHaveBeenCalledWith(
        { id: '1', correo: 'test@test.com', rol: 'ADMIN' },
        expect.any(String),
        { expiresIn: '24h' }
      );
    });
  });
});
