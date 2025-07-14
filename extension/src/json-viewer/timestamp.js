function pad(number) {
  return number.toString().padStart(2, '0');
}

function timestamp() {
  const date = new Date();
  const {
    getMonth,
    getDate,
    getFullYear,
    getHours,
    getMinutes,
    getSeconds
  } = date;

  const month = getMonth() + 1;
  const day = getDate();
  const hour = getHours();
  const min = getMinutes();
  const sec = getSeconds();

  return `${pad(month)}/${pad(day)}/${getFullYear()} ${pad(hour)}:${pad(min)}:${pad(sec)}`;
}

export default timestamp;
