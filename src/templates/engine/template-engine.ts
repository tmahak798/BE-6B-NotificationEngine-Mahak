import Handlebars from 'handlebars';

// Register custom helpers for Indian formatting
// These are reusable functions you can call inside templates

// Formats numbers as Indian currency: 125000 -> ₹1,25,000
Handlebars.registerHelper('inr', (amount: number) => {
  if (typeof amount !== 'number') return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
});

// Truncates text to a max length with ellipsis
Handlebars.registerHelper('truncate', (text: string, maxLength: number) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
});

// Formats a date string to readable format
Handlebars.registerHelper('formatDate', (dateString: string) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
});

// The main render function
// Takes a template string and data, returns rendered message
export function renderTemplate(
  templateString: string,
  data: Record<string, unknown>
): string {
  try {
    const compiled = Handlebars.compile(templateString);
    return compiled(data);
  } catch (error) {
    console.error('Template rendering failed:', error);
    return templateString; // return raw template as fallback
  }
}

// Truncates SMS to 160 characters intelligently
export function truncateSms(message: string): string {
  if (message.length <= 160) return message;
  return message.substring(0, 157) + '...';
}