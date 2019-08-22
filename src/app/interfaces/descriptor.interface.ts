enum DescriptorClass {
  ONE = 1,
  TWO = 2,
  THREE = 3,
  FOUR = 4,
}

enum DescriptorDefinitionSource {
    AIR = 'AIR',
    ALT = 'ALT',
    AOT = 'AOT',
    CCC = 'CCC',
    CHV = 'CHV',
    CSP = 'CSP',
    FMA = 'FMA',
    GO = 'GO',
    HL7V30 = 'HL7V3.0',
    HPO = 'HPO',
    ICF = 'ICF',
    ICF_CY = 'ICF-CY',
    JABL = 'JABL',
    LNC = 'LNC',
    MCM = 'MCM',
    MDR = 'MDR',
    MDRCZE = 'MDRCZE',
    MDRDUT = 'MDRDUT',
    MDRFRE = 'MDRFRE',
    MDRGER = 'MDRGER',
    MDRHUN = 'MDRHUN',
    MDRITA = 'MDRITA',
    MDRJPN = 'MDRJPN',
    MDRPOR = 'MDRPOR',
    MDRSPA = 'MDRSPA',
    MEDLINEPLUS = 'MEDLINEPLUS',
    MSH = 'MSH',
    MSHCZE = 'MSHCZE',
    MSHFRE = 'MSHFRE',
    MSHNOR = 'MSHNOR',
    MSHPOR = 'MSHPOR',
    MSHSCR = 'MSHSCR',
    MSHSPA = 'MSHSPA',
    NANDA_I = 'NANDA-I',
    NCI = 'NCI',
    NCI_BRIDG = 'NCI_BRIDG',
    NCI_BioC = 'NCI_BioC',
    NCI_CDISC = 'NCI_CDISC',
    NCI_CRCH = 'NCI_CRCH',
    NCI_CTCAE = 'NCI_CTCAE',
    NCI_CTEP_SDC = 'NCI_CTEP-SDC',
    NCI_CareLex = 'NCI_CareLex',
    NCI_DICOM = 'NCI_DICOM',
    NCI_FDA = 'NCI_FDA',
    NCI_GAIA = 'NCI_GAIA',
    NCI_KEGG = 'NCI_KEGG',
    NCI_NCI_GLOSS = 'NCI_NCI-GLOSS',
    NCI_NICHD = 'NCI_NICHD',
    NDFRT = 'NDFRT',
    NIC = 'NIC',
    NOC = 'NOC',
    NUCCPT = 'NUCCPT',
    OMS = 'OMS',
    PDQ = 'PDQ',
    PNDS = 'PNDS',
    PSY = 'PSY',
    SCTSPA = 'SCTSPA',
    SNOMEDCT_US = 'SNOMEDCT_US',
    SOP = 'SOP',
    SPN = 'SPN',
    UMD = 'UMD',
    UWDA = 'UWDA',
}

export interface DescriptorDefinitionInterface {
  descriptorDefinitionId?: number;
  descriptorId?: number;
  source?: DescriptorDefinitionSource;
  definition?: string;
  descriptor?: DescriptorInterface;
}

export interface TreeNumber {
  treeNumberId?: number;
  treeNumber?: string;
  descriptors?: DescriptorInterface[];
}

export interface ConceptInterface {
  conceptId?: number;
  ui?: string;
  name?: string;
  casn1Name?: string;
  registryNumber?: string;
  scopeNote?: string;
  translatorsEnglishScopeNote?: string;
  translatorsScopeNote?: string;
  // TODO: relatedRegistryNumbers
  // TODO: conceptRelatedRegistryNumbers
  // TODO: terms
  // TODO: conceptTerms
  // TODO: qualifiers
  // TODO: descriptors
  // TODO: supplementals
  // TODO: descriptorConcepts
  // TODO: qualifierConcepts
  // TODO: supplementalConcepts
}

export interface DescriptorConceptInterface {
  descriptorConceptId?: number;
  descriptorId?: number;
  conceptId?: number;
  isPreferred?: boolean;
  descriptor?: DescriptorInterface;
  concept?: ConceptInterface;
}


export interface DescriptorInterface {
  descriptorId?: number;
  class?: DescriptorClass;
  ui: string;
  name?: string;
  created?: Date;
  revised?: Date;
  established?: Date;
  annotation?: string;
  historyNote?: string;
  nlmClassificationNumber?: string;
  onlineNote?: string;
  publicMeshNote?: string;
  considerAlso?: string;
  treeNumbers: TreeNumber[];
  descriptorConcepts?: DescriptorConceptInterface[];
  definitions?: DescriptorDefinitionInterface[];
}
