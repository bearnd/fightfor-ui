import { TermInterface } from './term.interface';
import { FuseOptions } from 'fuse.js';

export interface TermsFilterServiceInterface {
  fuseOptions: FuseOptions;
  termsAll: TermInterface[];
  termsSelected: TermInterface[];
  filterTerms(query: string, doExcludeSelected?: boolean): TermInterface[];
  addTerm(term: TermInterface): void;
  removeTerm(term: TermInterface): void;
}
