/** Formats a price the way the site shows it: "Rs. 500". */
export const formatPrice = (amount: number): string => `Rs. ${amount}`;

/** Reads a price the way the site shows it: "Rs. 500" becomes 500. */
export const parsePrice = (text: string): number => Number(text.replace('Rs.', '').trim());
