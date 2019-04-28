import * as momentParser from 'moment-parser';
import * as moment from 'moment';

/**
 * Casts an enumeration into an array of objects with and `id` property holding
 * the enumeration member and a `name` property holding the enumeration value.
 * @param enumeration The enumeration to cast.
 * @returns The enumeration casted to an array of objects.
 */
export function castEnumToArray(enumeration): {id: string, name: string}[] {
  // Initialize an empty array to be populated with the casted enumeration.
  const arr: { id: string, name: string }[] = [];

  // Iterate over the enumeration keys, i.e., member-names, setting them as
  // the values of the `id` property while setting the enumeration values as
  // the values of the `name` property.
  for (const n of Object.keys(enumeration)) {
    if (typeof enumeration[n] === 'string') {
      arr.push({id: n, name: <any>enumeration[n]});
    }
  }

  return arr;
}

/**
 * Returns a copy of an array of strings sorted alphabetically.
 * @param {string[]} entries The array of strings to be copied and sorted.
 * @returns {string[]} The sorted copy of the array.
 */
export function orderStringArray(entries: string[]): string[] {

  // Create a copy of the array.
  const entriesSorted = entries.slice();

  // Sort the array copy alphabetically.
  entriesSorted.sort(
    (left, right) => {
      if (left < right) {
        return -1;
      }
      if (left > right) {
        return 1;
      }
      return 0;
    }
  );

  return entriesSorted;
}


/**
 * Converts an interval string to a number of seconds.
 * @param interval The interval to be converted.
 * @returns The corresponding number of seconds the interval was converted to or
 * `null` if parsing was not possible.
 */
export function intervalToSec(interval: string): number | null {
  if (interval) {
    // As the `moment-parser` library doesn't support the plural forms of units
    // replace any such occurences with their plural form.
    interval = interval.replace('Years', 'year');
    interval = interval.replace('Months', 'month');
    interval = interval.replace('Weeks', 'week');
    interval = interval.replace('Days', 'day');
    interval = interval.replace('Hours', 'hour');
    interval = interval.replace('Minutes', 'minute');
    interval = interval.replace('Seconds', 'second');

    // Parse the interval string into an object that can be used to construct
    // a `moment.Duration` object.
    const intervalParsed = momentParser.parse(interval);

    if (!intervalParsed) {
      return null;
    }

    // Construct a `moment.Duration` object based on the value and unit of the
    // parsed interval.
    const duration = moment.duration(
      intervalParsed.value,
      intervalParsed.unit,
    );

    // Return the total number of seconds the duration represents.
    return duration.asSeconds();
  } else {
    return null;
  }

}
