import {
  MeshTermType,
  StudyOverallStatus,
} from '../interfaces/study.interface';


/**
 * Casts a fully-qualified overall-status enum string coming from GraphQL,
 * e.g. `OverallStatusType.COMPLETED` to the enum value as defined under the
 * the `StudyOverallStatus` enum.
 * @param {string} status The fully-qualified overall-status enum string.
 * @returns {string} The corresponding `StudyOverallStatus` value.
 */
export function castOverallStatus(status: string): StudyOverallStatus {
  // Split the string on `.` and keep the second part of the string with the
  // enum member name.
  const status_value = status.split('.')[1];

  // Get corresponding `StudyOverallStatus` member.
  return StudyOverallStatus[status_value];
}

/**
 * Casts a fully-qualified mesh-term-type enum string coming from GraphQL,
 * e.g. `MeshTermType.CONDITION` to the enum value as defined under the
 * the `MeshTermType` enum.
 * @param {string} type The fully-qualified mesh-term-type enum string.
 * @returns {string} The corresponding `MeshTermType` value.
 */
export function castMeshTermType(type: string): MeshTermType {
  // Split the string on `.` and keep the second part of the string with the
  // enum member name.
  const type_value = type.split('.')[1];

  // Get corresponding `MeshTermType` member.
  return MeshTermType[type_value];
}

/**
 * Casts an enumeration into an array of objects with and `id` property holding
 * the enumeration member and a `name` property holding the enumeration value.
 * @param enumeration The enumeration to cast.
 * @returns {{id: string, name: string}[]} The enumeration casted to an array
 * of objects.
 */
export function castEnumToArray(enumeration) {
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

  return arr
}
