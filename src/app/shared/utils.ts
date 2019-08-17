import * as momentParser from 'moment-parser';
import * as moment from 'moment';
import { FacilityCanonicalInterface } from '../interfaces/study.interface';
import { ReplaySubject } from 'rxjs/Rx';

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
 * @param entries The array of strings to be copied and sorted.
 * @returns The sorted copy of the array.
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
 * Returns a copy of an array of objects sorted alphabetically based on the
 * value of a given property.
 * @param entries The array of objects to be copied and sorted.
 * @param propertyName The name of the property to sort by.
 * @returns The sorted copy of the array.
 */
export function orderObjectArray(
  entries: object[],
  propertyName: string,
): object[] {

  // Create a copy of the array.
  const entriesSorted = entries.slice();

  // Sort the array copy alphabetically.
  entriesSorted.sort(
    (left, right) => {
      if (left[propertyName] < right[propertyName]) {
        return -1;
      }
      if (left[propertyName] > right[propertyName]) {
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

/**
 * Flattens the contents of a `FacilityCanonicalInterface` object into a
 * `locality, administrativeAreaLevel1, country` string allowing for one or
 * mode of these components to be missing.
 * @param facility The canonical facility object to be flattened.
 * @returns The flattened facility representation or null.
 */
export function flattenFacilityCanonical(
  facility: FacilityCanonicalInterface,
): string | null {
  // Return `null` if the facility is not defined.
  if (!facility) {
    return null;
  }

  // Collect the facility components in an array.
  let components: string[] = [
    facility.locality,
    facility.administrativeAreaLevel1,
    facility.country,
  ];

  // Filter out components that are undefined, null, or empty strings.
  components = components.filter((x) => {
    return typeof x !== 'undefined' && x;
  });

  // Return the array above joined by commas.
  return components.join(', ');
}

export function filterValues(
  values: any[],
  query: any,
  subjectFiltered: ReplaySubject<any>,
  propertyName: string,
) {
  if (!values) {
    return;
  }

  // If no query was provided emit all possible study-country values.
  // Otherwise lowercase the query in preparation for filtering.
  if (!query) {
    subjectFiltered.next(values.slice());
    return;
  } else {
    query = query.toLowerCase();
  }

  // Filter the possible study-countries values based on the search query and
  // emit the results.
  subjectFiltered.next(
    values.filter(
      entry => entry[propertyName].toLowerCase().indexOf(query) > -1
    )
  );
}
