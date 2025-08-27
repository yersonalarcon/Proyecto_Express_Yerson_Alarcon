import {body} from 'express-validator';



export const createUserValidator = [
    body('name').isLength({min:2}).exists().withMessage('El nombre debe existir con min 2 caracteres'),
    body('phone').isMobilePhone('es-CO').exists().withMessage('El numero telefonico es obligatorio.'),
    body('email').isEmail().exists().withMessage('debe ser un email valido y obligadorio'),
    body('position').isIn(['admin','user']).exists().withMessage('El rol debe ser admin o user y es obligatorio'),
    body('password').isStrongPassword().exists().withMessage('La contraseña debe ser obligatoria y debe ser uno fuerte')
];

export const updateUserValidator = createUserValidator.filter((valor, indice)=>indice<=2)

export const loginValidator = [
    body('email').isEmail().exists().withMessage('debe ser un email valido y obligadorio'),
    body('password').exists().withMessage('Debe enviar la contraseña')
]