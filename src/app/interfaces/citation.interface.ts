export enum ArticlePubModel {
    PRINT = 'print',
    PRINT_ELECTRONIC = 'print_electronic',
    ELECTRONIC = 'electronic',
    ELECTRONIC_PRINT = 'electronic_print',
    ELECTRONIC_ECOLLECTION = 'electronic_ecollection',
}

export enum JournalIssnType {
    PRINT = 'print',
    ELECTRONIC = 'electronic',
    UNDETERMINED = 'undetermined',
}

export interface AffiliationCanonicalInterface {
  affiliationCanonicalId?: number
  googlePlaceId?: string
  name?: string
  googleUrl?: string
  url?: string
  address?: string
  phoneNumber?: string
  coordinates?: string
  country?: string
  administrativeAreaLevel1?: string
  administrativeAreaLevel2?: string
  administrativeAreaLevel3?: string
  administrativeAreaLevel4?: string
  administrativeAreaLevel5?: string
  locality?: string
  sublocality?: string
  sublocalityLevel1?: string
  sublocalityLevel2?: string
  sublocalityLevel3?: string
  sublocalityLevel4?: string
  sublocalityLevel5?: string
  colloquialArea?: string
  floor?: string
  room?: string
  intersection?: string
  neighborhood?: string
  postBox?: string
  postalCode?: string
  postalCodePrefix?: string
  postalCodeSuffix?: string
  postalTown?: string
  premise?: string
  subpremise?: string
  route?: string
  streetAddress?: string
  streetNumber?: string
  articles?: ArticleInterface[]
}

export interface JournalInterface {
  journalId?: number
  issn?: string
  issnType?: JournalIssnType
  title?: string
  abbreviation?: string
  articles: ArticleInterface[]
}

export interface ArticleInterface {
  articleId?: number
  publicationYear?: number
  publicationMonth?: number
  publicationDay?: number
  datePublished?: Date
  publicationModel?: ArticlePubModel
  journalId?: number
  journalVolume?: string
  journalIssue?: string
  title?: number
  pagination?: number
  language?: number
  titleVernacular?: number
  journal?: JournalInterface
  affiliationsCanonical?: AffiliationCanonicalInterface[]
}

export interface JournalInfoInterface {
  journalInfoId?: number
  nlmid?: string
  issn?: string
  country?: string
  abbreviation?: string
}

export interface ChemicalInterface {
  chemicalId?: number
  numRegistry?: string
  uid?: string
  chemical?: string
  citations?: CitationInterface[]
}

export interface CitationDescriptorQualifierInterface {
  citationDescriptorQualifierId?: number
  citationId?: number
  descriptorId?: number
  isDescriptorMajor?: boolean
  qualifierId?: number
  isQualifierMajor?: boolean
}

export interface PubMedDescriptorInterface {
  descriptorId?: number
  uid?: string
  descriptor?: string
}

export interface PubMedQualifierInterface {
  qualifierId?: number
  uid?: string
  qualifier?: string
}

export interface CitationInterface {
  citationId?: number
  pmid?: number
  dateCreated?: Date
  dateCompletion?: Date
  dateRevision?: Date
  articleId?: number
  journalInfoId?: number
  numReferences?: number
  article?: ArticleInterface
  journalInfo?: JournalInfoInterface
  chemicals?: ChemicalInterface[]
  descriptorsQualifiers?: CitationDescriptorQualifierInterface[]
  descriptors?: PubMedDescriptorInterface[]
  qualifiers?: PubMedQualifierInterface[]
}
