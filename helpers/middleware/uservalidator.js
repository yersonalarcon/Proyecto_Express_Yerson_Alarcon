import { body } from 'express-validator';

// Validador para la creación de un nuevo usuario
export const createUserValidator = [
    // Se corrige el nombre de 'name' a 'full_name' para coincidir con el formulario y el controlador
    body('full_name').isLength({ min: 2 }).exists().withMessage('El nombre completo debe tener al menos 2 caracteres y es obligatorio'),
    // Se añade un mensaje de error claro para el teléfono
    body('phone').isMobilePhone('es-CO').exists().withMessage('El número telefónico es obligatorio y debe ser válido para Colombia'),
    body('email').isEmail().exists().withMessage('Debe ser un email válido y obligatorio'),
    // Se corrige el nombre de 'position' a 'role' para coincidir con el formulario y el controlador
    body('role').isIn(['admin', 'user']).exists().withMessage('El rol debe ser "admin" o "user" y es obligatorio'),
    body('password').isStrongPassword().exists().withMessage('La contraseña debe ser obligatoria y debe ser fuerte')
];

// Validador para la actualización de un usuario (los campos son opcionales)
// Se reescribe para ser más robusto y no depender de la posición en el otro array
export const updateUserValidator = [
    body('full_name').optional().isLength({ min: 2 }).withMessage('El nombre completo debe tener al menos 2 caracteres'),
    body('phone').optional().isMobilePhone('es-CO').withMessage('El número telefónico debe ser válido para Colombia'),
    body('email').optional().isEmail().withMessage('Debe ser un email válido'),
    body('role').optional().isIn(['admin', 'user']).withMessage('El rol debe ser "admin" o "user"'),
    body('password').optional().isStrongPassword().withMessage('La contraseña debe ser fuerte')
];

// Validador para el inicio de sesión
export const loginValidator = [
    body('email').isEmail().exists().withMessage('El email debe ser válido y es obligatorio'),
    body('password').exists().withMessage('La contraseña es obligatoria')
];
