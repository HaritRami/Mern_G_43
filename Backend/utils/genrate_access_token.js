import jwt from 'jsonwebtoken';

const getAccessTokenSecret = () => {
  return process.env.SECRET_KEY_ACCESS_TOKEN || process.env.ACCESS_TOKEN_SECRET;
};

const genrateAccessTokan = async (userId) => {
  const secret = getAccessTokenSecret();
  if (!secret) {
    throw new Error('ACCESS_TOKEN_SECRET is not defined. Please set SECRET_KEY_ACCESS_TOKEN or ACCESS_TOKEN_SECRET.');
  }
  const tokan = await jwt.sign({ id: userId }, secret, { expiresIn: '5h' });
  return tokan;
};

export default genrateAccessTokan;
