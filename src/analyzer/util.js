function average(numbers) {
  if (!numbers.length) return 0;
  return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

function daysBetween(earlier, later) {
  return (new Date(later).getTime() - new Date(earlier).getTime()) / (1000 * 60 * 60 * 24);
}

module.exports = { average, round2, daysBetween };
