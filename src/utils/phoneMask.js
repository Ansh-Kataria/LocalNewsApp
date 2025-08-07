/**
 * Masks a phone number to display only first 3 and last 2 digits
 * Example: "9876543210" becomes "987****10"
 * @param {string} phone - The phone number to mask
 * @returns {string} The masked phone number
 */
export const maskPhoneNumber = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return phone;
  }

  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 5) {
    return phone; // Return original if too short
  }

  // Mask middle digits
  const firstThree = digits.slice(0, 3);
  const lastTwo = digits.slice(-2);
  
  return `${firstThree}****${lastTwo}`;
};

/**
 * Validates if a phone number is in correct format
 * @param {string} phone - The phone number to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validatePhoneNumber = (phone) => {
  if (!phone) return false;
  
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10;
}; 