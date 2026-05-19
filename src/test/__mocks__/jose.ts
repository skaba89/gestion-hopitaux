// Mock for jose (ESM-only package)
export const jwtVerify = jest.fn().mockResolvedValue({ payload: {}, protectedHeader: {} });
export const SignJWT = jest.fn().mockReturnValue({
  setProtectedHeader: jest.fn().mockReturnThis(),
  setExpirationTime: jest.fn().mockReturnThis(),
  setSubject: jest.fn().mockReturnThis(),
  sign: jest.fn().mockResolvedValue('mock-jwt-token'),
});
export const jwtSign = jest.fn().mockResolvedValue('mock-jwt-token');
export default { jwtVerify, SignJWT, jwtSign };
