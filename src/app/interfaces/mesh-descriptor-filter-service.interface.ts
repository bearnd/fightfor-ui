import { FuseOptions } from 'fuse.js';
import { MeshDescriptorInterface } from './mesh-descriptor.interface';

export interface MeshDescriptorFilterServiceInterface {
  fuseOptions: FuseOptions;
  descriptorsAll: MeshDescriptorInterface[];
  descriptorsSelected: MeshDescriptorInterface[];
  filterTerms(query: string, doExcludeSelected?: boolean): MeshDescriptorInterface[];
  addTerm(term: MeshDescriptorInterface): void;
  removeTerm(term: MeshDescriptorInterface): void;
}
