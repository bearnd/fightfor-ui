import * as Fuse from 'fuse.js';
import { FuseOptions } from 'fuse.js';

import { MeshDescriptorInterface } from '../interfaces/mesh-descriptor.interface';


export class MeshDescriptorFilterService implements MeshDescriptorFilterService {

  fuseOptions: FuseOptions = {
    shouldSort: true,
    threshold: 0.6,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      'name',
    ]
  };

  public descriptorsAll: MeshDescriptorInterface[];
  public descriptorsSelected: MeshDescriptorInterface[];

  constructor(descriptorsAll: MeshDescriptorInterface[]) {
    this.descriptorsAll = descriptorsAll;
    this.descriptorsSelected = [];
  }

  addDescriptor(descriptor: MeshDescriptorInterface): void {
    this.descriptorsSelected.push(descriptor);
  }

  removeDescriptor(descriptor: MeshDescriptorInterface): void {
    const index = this.descriptorsSelected.indexOf(descriptor);

    if (index >= 0) {
      this.descriptorsSelected.splice(index, 1);
    }
  }

  filterDescriptors(
    query: string,
    doExcludeSelected: boolean = true,
  ): MeshDescriptorInterface[] {

    let descriptorsFiltered: MeshDescriptorInterface[];

    // (Optionally) exclude descriptors that have already been included in `descriptorsSelected`.
    if (doExcludeSelected) {
      descriptorsFiltered = this.descriptorsAll.filter(term =>
        this.descriptorsSelected.indexOf(term) === -1
      );
    }

    // If the `query` is an empty string then skip the filtering.
    if (query === '') {
      return descriptorsFiltered;
    }

    // Create a new `Fuse` search object with the predefined options.
    const fuse = new Fuse(descriptorsFiltered, this.fuseOptions);

    // Perform a fuzzy-search through the tag names using the query.
    descriptorsFiltered = fuse.search(query);

    return descriptorsFiltered;
  }
}
