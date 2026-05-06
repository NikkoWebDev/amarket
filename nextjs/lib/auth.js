import jwt from 'jsonwebtoken';

export function signToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

export function getUserFromRequest(request) {
  const header = request.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  const token = header.split(' ')[1];
  return verifyToken(token);
}

export function requireRole(user, ...roles) {
  if (!user) return { error: 'Token no proporcionado o inválido', status: 401 };
  if (!roles.includes(user.rol)) {
    return { error: 'Acceso denegado', status: 403 };
  }
  return null;
}
