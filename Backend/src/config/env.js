function envNumber(name, defaultValue) {
  const value = process.env[name];
  if (value === undefined) return defaultValue;

  const n = Number(value);
  if (Number.isNaN(n)) {
    return defaultValue;
  }
  return n;
}

module.exports = { envNumber };
