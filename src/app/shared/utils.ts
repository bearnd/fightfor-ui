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
