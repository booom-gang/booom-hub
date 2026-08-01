export const sanitizeString = (str) => {
  if (typeof str !== 'string') return '';
  return str.trim().replace(/\s+/g, ' ');
};

export const validateUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return 'Username is required';
  }
  const trimmed = username.trim();
  if (trimmed.length < 2) {
    return 'Username must be at least 2 characters';
  }
  if (trimmed.length > 30) {
    return 'Username cannot exceed 30 characters';
  }
  if (!/^[a-zA-Z0-9_\s]+$/.test(trimmed)) {
    return 'Username can only contain letters, numbers, underscores, and spaces';
  }
  return null;
};

export const validateMessageText = (text) => {
  if (!text || typeof text !== 'string') {
    return 'Message text is required';
  }
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 'Message cannot be empty';
  }
  if (trimmed.length > 2000) {
    return 'Message cannot exceed 2000 characters';
  }
  return null;
};

export const validateEventInput = (body) => {
  const errors = [];
  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('Title is required');
  } else if (body.title.trim().length > 120) {
    errors.push('Title cannot exceed 120 characters');
  }
  if (!body.date) {
    errors.push('Date is required');
  } else if (isNaN(Date.parse(body.date))) {
    errors.push('Invalid date format');
  }
  if (body.description && typeof body.description === 'string' && body.description.length > 1000) {
    errors.push('Description cannot exceed 1000 characters');
  }
  return errors.length > 0 ? errors : null;
};
