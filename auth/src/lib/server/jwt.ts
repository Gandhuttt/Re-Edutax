import { env } from '$env/dynamic/private';
import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';

const accessTokenSecret = env.JWT_ACCESS_SECRET ?? env.BETTER_AUTH_SECRET;

if (!accessTokenSecret) {
	throw new Error('JWT_ACCESS_SECRET or BETTER_AUTH_SECRET must be set');
}

const accessTokenIssuer = env.JWT_ACCESS_ISSUER ?? 'auth-service';
const accessTokenAudience = env.JWT_ACCESS_AUDIENCE ?? 'internal-services';
const accessTokenExpiresIn = (env.JWT_ACCESS_EXPIRES_IN ?? '15m') as SignOptions['expiresIn'];

export type AccessTokenClaims = JwtPayload & {
	sub: string;
	email: string;
	name?: string | null;
	role?: string;
	jenisWp?: string;
	kategoriWp?: string;
};

type SignAccessTokenInput = {
	sub: string;
	email: string;
	name?: string | null;
	role?: string;
	jenisWp?: string;
	kategoriWp?: string;
};

export const accessTokenConfig = {
	issuer: accessTokenIssuer,
	audience: accessTokenAudience,
	expiresIn: accessTokenExpiresIn,
};

export function signAccessToken(payload: SignAccessTokenInput) {
	return jwt.sign(payload, accessTokenSecret, {
		algorithm: 'HS256',
		issuer: accessTokenIssuer,
		audience: accessTokenAudience,
		expiresIn: accessTokenExpiresIn,
	});
}

export function verifyAccessToken(token: string) {
	const decoded = jwt.verify(token, accessTokenSecret, {
		algorithms: ['HS256'],
		issuer: accessTokenIssuer,
		audience: accessTokenAudience,
	});

	if (typeof decoded === 'string') {
		throw new Error('Invalid access token payload');
	}

	if (typeof decoded.sub !== 'string' || typeof decoded.email !== 'string') {
		throw new Error('Access token is missing required claims');
	}

	return decoded as AccessTokenClaims;
}

export function getBearerToken(request: Request) {
	const authorization = request.headers.get('authorization');

	if (!authorization?.startsWith('Bearer ')) {
		return null;
	}

	return authorization.slice('Bearer '.length).trim() || null;
}

export function authenticateBearerRequest(request: Request) {
	const token = getBearerToken(request);

	if (!token) {
		return null;
	}

	try {
		return verifyAccessToken(token);
	} catch {
		return null;
	}
}
