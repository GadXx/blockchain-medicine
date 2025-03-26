import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const generateToken = (userId: string): string => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: '12h',
    });
};

const verifyToken = (token: string): string | jwt.JwtPayload => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
};

// Генерируем токен
const token = generateToken('1234');

// Верифицируем токен
const decoded = verifyToken(token);

// Достаем id
const userId = (decoded as jwt.JwtPayload).id;

console.log('Generated Token:', token);
console.log('Decoded Token:', decoded);
console.log('User ID:', userId);
