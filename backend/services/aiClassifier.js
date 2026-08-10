/**
 * AI Classification Service
 * In production this would call Claude Vision / Google Vision API.
 * For this project, it uses keyword-heuristic matching on filename/mimetype
 * and simulates a confidence score — matching the MobileNet simulation in the frontend.
 */

const CATEGORY_KEYWORDS = {
  'Broken Road': ['road', 'pothole', 'crack', 'asphalt', 'pavement', 'broken'],
  'Garbage': ['garbage', 'trash', 'waste', 'litter', 'dump', 'bin', 'overflow'],
  'Street Light': ['light', 'lamp', 'dark', 'electric', 'wire', 'pole'],
  'Waterlogging': ['water', 'flood', 'drain', 'puddle', 'sewage', 'log'],
  'Illegal Dumping': ['illegal', 'dump', 'waste', 'rubbish'],
};

const PRIORITY_DEFAULTS = {
  'Broken Road': 'High',
  'Garbage': 'Low',
  'Street Light': 'Low',
  'Waterlogging': 'High',
  'Illegal Dumping': 'Medium',
  'Other': 'Medium',
};

const CRITICAL_WORDS = ['dangerous', 'collapse', 'accident', 'fire', 'sparking', 'exposed wire', 'flooding'];

/**
 * Classify an issue from description text.
 * Returns { issueType, confidence, priority }
 */
const classifyFromText = (description = '') => {
  const lower = description.toLowerCase();

  let bestCategory = 'Other';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const score = keywords.filter(kw => lower.includes(kw)).length;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  const confidence = bestScore > 0 ? Math.min(60 + bestScore * 10, 98) : 45;

  const hasCritical = CRITICAL_WORDS.some(w => lower.includes(w));
  const priority = hasCritical ? 'Critical' : PRIORITY_DEFAULTS[bestCategory] || 'Medium';

  return { issueType: bestCategory, confidence, priority };
};

module.exports = { classifyFromText };
