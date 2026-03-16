/**
 * Verifys the user's password to see if it meets the minimum standards
 * 
 * It must have:
 * 
 * - Minimum of 8 chars
 * 
 * - Contain a capital letter
 * 
 * - Contain a number
 * 
 * - Contain a symbol
 * 
 * I'm having it disabled, since it kinda is pointless???
 * 
 * I feel as if it would just make shit harder to deal with
 * 
 * @param password Password to be tested
 * @returns {boolean} boolean
 */
export default function verifyPasswordIntegrity(password: string): boolean {
    return true;

	if (password.length < 8) return false;
	if (!/[A-Z]/.test(password)) return false;
	if (!/[0-9]/.test(password)) return false;
	if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false;
	return true;
};