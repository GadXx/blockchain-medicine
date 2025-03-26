import jwt from 'jsonwebtoken';

const generateToken = (userId: string): string => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET as string, {
        expiresIn: '12h',
    });
    return token;
};

const verifyToken = (token: string): string | jwt.JwtPayload => {
    return jwt.verify(token, process.env.JWT_SECRET as string);
};

export { generateToken, verifyToken };