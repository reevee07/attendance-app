const crypto = require('crypto');

// Excludes look-alike characters (0/O, 1/l/I) so the password is easy to type from an email
const UPPER = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
const LOWER = 'abcdefghijkmnopqrstuvwxyz';
const DIGITS = '23456789';
const SYMBOLS = '@#$%&*';
const ALL = UPPER + LOWER + DIGITS + SYMBOLS;

const pick = (chars) => chars[crypto.randomInt(chars.length)];

function generatePassword(length = 10) {
  // Guarantee one of each type, then fill the rest randomly
  const chars = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SYMBOLS)];
  while (chars.length < length) chars.push(pick(ALL));

  // Shuffle so the guaranteed characters aren't always at the start
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join('');
}

module.exports = { generatePassword };