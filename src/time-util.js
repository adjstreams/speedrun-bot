export function calculateSeconds(hms) {
  if (typeof hms !== "string") {
    return false;
  }

  var a = hms.split(":");

  if (a.length === 3) {
    return +a[0] * 60 * 60 + +a[1] * 60 + +a[2];
  } else if (a.length === 2) {
    return +a[0] * 60 + +a[1];
  } else if (a.length === 1) {
    return +a[0];
  }
}

export function convertToHHMMSS(seconds) {
  if (!Number.isInteger(seconds)) {
    return false;
  }

  return new Date(seconds * 1000).toISOString().substr(11, 8);
}

export function isValidTimeFormat(arg) {
  if (Array.isArray(arg)) {
    return false;
  }

  var re = /(\d{1,2}:)?([0-5]\d):([0-5]\d)/;
  return re.test(arg);
}
