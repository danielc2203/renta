const dianCalendarRules = `{"august":{"year":"2026","month":"08","days":["12","13","14","18","19","20","21","24","25","26","27","28","31"]},"september":{"year":"2026","month":"09","days":["1","2","3","4","7","8","9","10","11","14","15","16","17","18","21","22","23","24","25","28"]},"october":{"year":"2026","month":"10","days":["1","2","5","6","7","8","9","13","14","15","16","19","20","21","22","23","26"]}}`;

const buildDefaultConfig = () => {
  const config = {
    august: { year: '2026', month: '08', days: [] },
    september: { year: '2026', month: '09', days: [] },
    october: { year: '2026', month: '10', days: [] }
  };
  let digit = 1;
  [12, 13, 14, 18, 19, 20, 21, 24, 25, 26, 27, 28, 31].forEach(d => {
    config.august.days.push({ day: d, d1: digit.toString().padStart(2, '0'), d2: (digit+1).toString().padStart(2, '0') });
    digit += 2;
  });
  return config;
}

let initialData = buildDefaultConfig();
const parsed = JSON.parse(dianCalendarRules);
if (parsed.august && parsed.august.days && Array.isArray(parsed.august.days)) {
  if (typeof parsed.august.days[0] === 'string' || typeof parsed.august.days[0] === 'number') {
    initialData.august.year = parsed.august.year || '2026';
  } else if (parsed.august.days.length > 20) {
  } else {
    initialData = parsed;
  }
}
console.log(JSON.stringify(initialData.august.days[0]));
