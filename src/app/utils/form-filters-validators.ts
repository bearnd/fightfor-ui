import { AbstractControl } from '@angular/forms';

/**
 * Validates the filter form used in `StudiesListComponent` and
 * `FacilitiesListComponent` and ensures that the current location and max
 * distance are used in conjunction.
 * @param formFilters The filter form.
 * @returns The applicable error code or `null` if the form is valid.
 */
export function validateDistanceLocation(
  formFilters: AbstractControl
): { [key: string]: boolean } | null {

  // The form is invalid if the current location is used without setting a max
  // distance.
  if (
    formFilters.get('currentLocation').value &&
    !formFilters.get('selectDistanceMax').value
  ) {
    return {'locationWithoutDistance': true};
  }

  // The form is invalid if the max distance is used without setting the current
  // location.
  if (
    !formFilters.get('currentLocation').value &&
    formFilters.get('selectDistanceMax').value
  ) {
    return {'distanceWithoutLocation': true};
  }

  return null;
}
