function isValidCardType(type: string): boolean {
  const validTypes = ["virtual", "physical"];
  return validTypes.includes(type.toLowerCase());
}

function isValidFrequency(frequency: string): boolean {
  const validFrequencies = ["daily", "monthly", "yearly", "total"];
  return validFrequencies.includes(frequency.toLowerCase());
}

function isValidDate(dateStr: string): boolean {
  const regex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (!regex.test(dateStr)) return false;

  const [month, day, year] = dateStr.split("/").map(Number);
  const date = new Date(year, month - 1, day);

  return (
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getFullYear() === year
  );
}

export { isValidCardType, isValidDate, isValidFrequency };
