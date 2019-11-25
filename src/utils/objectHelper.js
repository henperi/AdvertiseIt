/**
 * @description Attempts to convert all values within an object keys to an integer
 * @param {Object<string, any>} data
 *
 * @returns {Object<string, number>} Returns the object with converted values or NaN
 */
const numberify = (data) => {
  /**
   * @type {Object<string, number>}
   */
  const numberedData = {};
  Object.keys(data).map((key) => {
    numberedData[key] = parseInt(data[key], 10);
    return numberedData;
  });
  return numberedData;
};

/**
 * @description Attempts to convert an object values to a string
 * @param {Object<string, any>} data
 *
 * @returns {Object<string, string>} Returns the object with converted values or NaN
 */
const stringifyObjValues = (data) => {
  /**
   * @type {Object<string, string>}
   */
  const stringData = {};
  Object.keys(data).map((key) => {
    stringData[key] = data[key].toString();
    return stringData;
  });

  return stringData;
};

/**
 * @description Attempts to trim white spaces within an object's values
 * @param {Object<string, string>} data
 *
 * @returns {Object<string, string>} Returns the trimmed object data
 */
const trimify = (data) => {
  /**
   * @type {Object<string, string>}
   */
  const strippedData = {};
  Object.keys(data).map((key) => {
    strippedData[key] = data[key].trim();
    return strippedData;
  });
  return strippedData;
};

export { numberify, trimify, stringifyObjValues };
