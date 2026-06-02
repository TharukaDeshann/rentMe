/**
 * Formats a numeric price into LKR currency format: Rs. XX,XXX.XX
 */
export function formatLKR(amount: number | string): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Rs. 0.00";
  return `Rs. ${num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
