## Changelog

### v0.13.0

- Story No. 1507: Replace manual user-config management with GraphQL re-querying.
- Story No. 1204: Search deletion error: GraphQL error: tuple index out of range.
- Story No. 1520: Add descriptor 'type' in new search dropdown.
- Story No. 1516: Remove `Features` button from menu.
- Story No. 887: Change single page design from routing links to the same position on the page (e.g. when going to TOS page, loads at bottom).
- Story No. 1323: Possible filter values set to `All` studies in `StudiesListComponent`.
- Story No. 1511: Restyle the search-deletion.
- Story No. 1436: Remove Helvetica font-family from privacy.component.html and from tos.component.html (allow font to default).
- Story No. 1329: Increase the margins between the intervention/condition chips and the headers in `StudyComponent`.

### v0.12.0

- Story No. 1487: Find a way to show the whole study title in the results tables.
- Story No. 1332: Fix or remove the responsive nav bar on the `AuthLayoutComponent`.
- Story No. 1493: Increase margins between table columns.
- Story No. 1466: Age slider defaults to an incomplete range.
- Story No. 1010: Connect clicking on map countries to the pre-filtered `StudiesListComponent`.
- Story No. 1306: Redo homepage features.

### v0.11.0

- Story No. 1325: Request to `https://bearnd.auth0.com/userinfo` returns 401.
- Story No. 1479: Could not create customer with ID 'facebook|10219772538845615': Customer ID is invalid.

### v0.10.0

- Story No. 1452: Preclude SentryErrorHandler from flooding the user with errors.
- Story No. 945: Replace Sentry feedback dialog with custom SweetAlert one.
- Story No. 1003: Create social-media accounts/pages.
- Story No. 1201: Establish active spinners for buttons that cause a delayed action.
- Story No. 1203: Gender radio buttons under `Eligibility` in `StudyComponent` are not disabled.

### v0.9.0

- Story No. 1425: getUserStudy: TypeError: Cannot read property 'length' of undefined.

### v0.8.0

- [ch1396]: Updated the `StudyComponent` and updated its template adding canonical facility guards and fallback strings when the canonical facility is not available.

### v0.7.1

- [ch1383]: Updated the `ngOnInit` method of the `StudiesListComponent` class to set `this.studies` to an empty array when undefined to avoid errors on conditions using `this.studies.length.

### v0.7.0

- Story No. 1357: Configure Auth0 client for multi-domain deployment.
- Story No. 1215: Look into producing a specific error when a user tries to use the app without authenticating their account.
- Story No. 1354: Change all references to support@bearnd.io to support@fightfor.app.
- Story No. 1347: TypeError: Cannot read property 'length' of undefined.
- Story No. 914: Review licensing and provide attribution to data-sources across the UI.

### v0.6.0

- Story No. 1337: TypeError: Cannot read property 'value' of null.

### v0.5.0

- Story No. 895: Complete homepage feature descriptions.
- Removed header text on pricing page.

### v0.4.0

- Story No. 1250: The `StudiesListComponent` in `saved mode` displays all studies. when no studies were followed.

### v0.3.0

- Story No. 1263: TypeError: Cannot read property 'name' of undefined.
- Story No. 1253: Sentry issues not sent in production.

### v0.2.0

- Updated `.gitignore`.
- Added GraphQL server schema.
- Added a temporary change to debug an issue in production.

### v0.1.1

- Fixed production configuration.

### v0.1.0

- Initial release.
