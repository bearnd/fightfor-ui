import { Observable } from 'rxjs/Rx';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import * as urljoin from 'url-join';

import { environment } from '../../environments/environment';


export interface MapBoxFeature {
  id: string
  type: string
  place_type: string[]
  place_name: string
  center: number[]
}

export interface MapBoxGeocodeResponse {
  type: string
  features: MapBoxFeature[]
}


export enum EnumGeolocationErrors {

  UNSUPPORTED_BROWSER = 'UNSUPPORTED_BROWSER',
  PERMISSION_DENIED = 'PERMISSION_DENIED',
  POSITION_UNAVAILABLE = 'POSITION UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
}


@Injectable()
export class GeolocationService {

  constructor(private httpClient: HttpClient) {}

  /**
   * Obtains the geographic position, in terms of latitude and longitude
   * coordinates, of the device.
   * @param {Object} [opts] An object literal to specify one or more of the
   * following attributes and desired values:
   *   - enableHighAccuracy: Specify true to obtain the most accurate position
   *   possible, or false to optimize in favor of performance and power
   *   consumption.
   *   - timeout: An Integer value that indicates the time, in milliseconds,
   *   allowed for obtaining the position. If timeout is Infinity, (the default
   *   value) the location request will not time out. If timeout is zero (0) or
   *   negative, the results depend on the behavior of the location provider.
   *   - maximumAge: An Integer value indicating the maximum age, in
   *   milliseconds, of cached position information. If maximumAge is non-zero,
   *   and a cached position that is no older than maximumAge is available,
   *   the cached position is used instead of obtaining an updated location. If
   *   maximumAge is zero (0), watchPosition always tries to obtain an updated
   *   position, even if a cached position is already available. If maximumAge
   *   is Infinity, any cached position is used, regardless of its age, and
   *   watchPosition only tries to obtain an updated position if no cached
   *   position data exists.
   * @returns {Observable} An observable sequence with the geographical
   * location of the device running the client.
   */
  getCurrentPositionBrowser(opts): Observable<any> {
    return Observable.create(observer => {

      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          (position) => {
            observer.next(position);
            observer.complete();
          },
          (error) => {
            switch (error.code) {
              case 1:
                observer.error(EnumGeolocationErrors.PERMISSION_DENIED);
                break;
              case 2:
                observer.error(EnumGeolocationErrors.POSITION_UNAVAILABLE);
                break;
              case 3:
                observer.error(EnumGeolocationErrors.TIMEOUT);
                break;
            }
          },
          opts);
      } else {
        observer.error(EnumGeolocationErrors.UNSUPPORTED_BROWSER);
      }

    });
  }

  /**
   * Performs a reverse geocoding request against the MapBox API converting
   * geocoordinates into candidate places.
   * @param {number} longitude The longitude.
   * @param {number} latitude The latitude.
   * @returns {Observable<MapBoxGeocodeResponse>} The request observable.
   */
  geocodeReverse(
    longitude: number,
    latitude: number,
  ): Observable<MapBoxGeocodeResponse> {

    // Assemble the request URL including the coordinates query and MapBox API
    // key.
    const url = urljoin(
      environment.mapbox.uri,
      'geocoding/v5/mapbox.places',
      [longitude, latitude].join(',') + '.json',
      '?access_token=' + environment.mapbox.apiKey,
    );

    // Return the request observable.
    return this.httpClient.get<MapBoxGeocodeResponse>(url);
  }

  /**
   * Performs a forward geocoding request against the MapBox API converting
   * a place name into candidate places.
   * @param {string} query The place name to perform a search for.
   * @returns {Observable<MapBoxGeocodeResponse>} The request observable.
   */
  geocodeForward(query: string): Observable<MapBoxGeocodeResponse> {
    // Assemble the request URL including the query and MapBox API key.
    const url = urljoin(
      environment.mapbox.uri,
      'geocoding/v5/mapbox.places',
      query + '.json',
      '?access_token=' + environment.mapbox.apiKey,
    );

    // Return the request observable.
    return this.httpClient.get<MapBoxGeocodeResponse>(url);
  }

}
