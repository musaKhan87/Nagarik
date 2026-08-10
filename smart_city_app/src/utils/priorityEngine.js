export const assignPriority = (issueType, description = '') => {
  const descLower = description.toLowerCase();
  
  // Critical keyword matching
  const criticalKeywords = ['dangerous', 'collapse', 'accident', 'fire', 'leak', 'flooding', 'sparking', 'exposed wire'];
  if (criticalKeywords.some(keyword => descLower.includes(keyword))) {
    return 'Critical';
  }

  // Fallback default priority by Issue Category type
  switch (issueType) {
    case 'Broken Road':
      return 'High';
    case 'Garbage':
      return 'Low';
    case 'Street Light':
      return 'Low';
    case 'Waterlogging':
      return 'High';
    case 'Illegal Dumping':
      return 'Medium';
    default:
      return 'Medium';
  }
};
