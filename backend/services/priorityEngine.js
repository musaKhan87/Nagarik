/**
 * Priority Score Engine — Evaluates issueType + description text
 * to dynamically classify priority as Critical, High, Medium, or Low.
 */

const CRITICAL_KEYWORDS = [
  'live wire', 'electric shock', 'fire', 'burst', 'flooding', 'flood',
  'severe', 'accident', 'collapse', 'collapsed', 'open drain', 'open sewer',
  'danger', 'emergency', 'hazard', 'toxic', 'explosion', 'gas leak', 'sparking'
];

const HIGH_KEYWORDS = [
  'deep pothole', 'overflowing', 'dark street', 'blocked road', 'heavy leak',
  'large dump', 'broken streetlight', 'foul smell', 'blackout', 'falling tree',
  'caved in', 'sewage leak', 'stagnant water'
];

const MEDIUM_KEYWORDS = [
  'litter', 'small pothole', 'dim light', 'slow leak', 'repair needed',
  'cracked', 'garbage bin full', 'uneven pavement'
];

const BASE_ISSUE_SCORES = {
  'Waterlogging': 40,
  'Sewage': 40,
  'Sanitation & Drains': 35,
  'Water Leakage': 35,
  'Broken Road': 25,
  'Potholes & Roads': 25,
  'Pothole': 25,
  'Garbage': 20,
  'Garbage & Waste': 20,
  'Illegal Dumping': 20,
  'Street Light': 20,
  'Streetlights': 20,
  'Broken Streetlight': 20,
  'Traffic & Parking': 20,
  'Footpaths & Signals': 15,
  'Parks & Trees': 15,
  'Other': 10
};

/**
 * Calculates priority score and returns priority level & SLA hours
 */
function calculatePriorityScore(issueType, description = '') {
  let score = BASE_ISSUE_SCORES[issueType] || 15;
  const descLower = description.toLowerCase();

  // Keyword Matching Score Boosts
  CRITICAL_KEYWORDS.forEach(kw => {
    if (descLower.includes(kw)) score += 35;
  });

  HIGH_KEYWORDS.forEach(kw => {
    if (descLower.includes(kw)) score += 20;
  });

  MEDIUM_KEYWORDS.forEach(kw => {
    if (descLower.includes(kw)) score += 10;
  });

  // Final Priority Classification
  let priority = 'Medium';
  let slaHours = 48;

  if (score >= 55) {
    priority = 'Critical';
    slaHours = 12;
  } else if (score >= 35) {
    priority = 'High';
    slaHours = 24;
  } else if (score >= 20) {
    priority = 'Medium';
    slaHours = 48;
  } else {
    priority = 'Low';
    slaHours = 72;
  }

  return {
    score,
    priority,
    slaHours
  };
}

module.exports = { calculatePriorityScore };
