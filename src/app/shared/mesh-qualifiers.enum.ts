export enum MeshQualifiers {
  METABOLISM = 'metabolism',
  ANALYSIS = 'analysis',
  BLOOD = 'blood',
  POISONING = 'poisoning',
  ENZYMOLOGY = 'enzymology',
  PHARMACOLOGY = 'pharmacology',
  DRUG_EFFECTS = 'drug effects',
  GROWTH_DEVELOPMENT = 'growth & development',
  ANTAGONISTS_INHIBITORS = 'antagonists & inhibitors',
  ISOLATION_PURIFICATION = 'isolation & purification',
  ULTRASTRUCTURE = 'ultrastructure',
  ADMINISTRATION_DOSAGE = 'administration & dosage',
  PHYSIOLOGY = 'physiology',
  BIOSYNTHESIS = 'biosynthesis',
  THERAPEUTIC_USE = 'therapeutic use',
  DRUG_THERAPY = 'drug therapy',
  ANALOGS_DERIVATIVES = 'analogs & derivatives',
  PHYSIOPATHOLOGY = 'physiopathology',
  CHEMICALLY_INDUCED = 'chemically induced',
  ADVERSE_EFFECTS = 'adverse effects',
  SECRETION = 'secretion',
  IMMUNOLOGY = 'immunology',
  STANDARDS = 'standards',
  URINE = 'urine',
  EMBRYOLOGY = 'embryology',
  DEFICIENCY = 'deficiency',
  GENETICS = 'genetics',
  VETERINARY = 'veterinary',
  DIAGNOSIS = 'diagnosis',
  ETIOLOGY = 'etiology',
  COMPLICATIONS = 'complications',
  PREVENTION_CONTROL = 'prevention & control',
  MICROBIOLOGY = 'microbiology',
  BLOOD_SUPPLY = 'blood supply',
  INNERVATION = 'innervation',
  ABNORMALITIES = 'abnormalities',
  DIAGNOSTIC_IMAGING = 'diagnostic imaging',
  SURGERY = 'surgery',
  PATHOLOGY = 'pathology',
  METHODS = 'methods',
  THERAPY = 'therapy',
  CHEMICAL_SYNTHESIS = 'chemical synthesis',
  MORTALITY = 'mortality',
  CYTOLOGY = 'cytology',
  TOXICITY = 'toxicity',
  CLASSIFICATION = 'classification',
  ANATOMY_HISTOLOGY = 'anatomy & histology',
  RADIATION_EFFECTS = 'radiation effects',
  HISTORY = 'history',
  EDUCATION = 'education',
  DIET_THERAPY = 'diet therapy',
  EPIDEMIOLOGY = 'epidemiology',
  UTILIZATION = 'utilization',
  PATHOGENICITY = 'pathogenicity',
  REHABILITATION = 'rehabilitation',
  INJURIES = 'injuries',
  PARASITOLOGY = 'parasitology',
  CEREBROSPINAL_FLUID = 'cerebrospinal fluid',
  SUPPLY_DISTRIBUTION = 'supply & distribution',
  MANPOWER = 'manpower',
  CONGENITAL = 'congenital',
  INSTRUMENTATION = 'instrumentation',
  RADIOTHERAPY = 'radiotherapy',
  ETHNOLOGY = 'ethnology',
  TRANSPLANTATION = 'transplantation',
  TRANSMISSION = 'transmission',
  NURSING = 'nursing',
  CHEMISTRY = 'chemistry',
  SECONDARY = 'secondary',
  PSYCHOLOGY = 'psychology',
  TRENDS = 'trends',
  LEGISLATION_JURISPRUDENCE = 'legislation & jurisprudence',
  ECONOMICS = 'economics',
  ORGANIZATION_ADMINISTRATION = 'organization & administration',
  PHARMACOKINETICS = 'pharmacokinetics',
  STATISTICS_NUMERICAL_DATA = 'statistics & numerical data',
  ETHICS = 'ethics',
  VIROLOGY = 'virology',
  AGONISTS = 'agonists',
}

export const meshQualifierGroups = {
  therapy: [
    MeshQualifiers.PHARMACOLOGY,
    MeshQualifiers.DRUG_EFFECTS,
    MeshQualifiers.ANTAGONISTS_INHIBITORS,
    MeshQualifiers.ISOLATION_PURIFICATION,
    MeshQualifiers.ADMINISTRATION_DOSAGE,
    MeshQualifiers.THERAPEUTIC_USE,
    MeshQualifiers.DRUG_THERAPY,
    MeshQualifiers.CHEMICALLY_INDUCED,
    MeshQualifiers.SURGERY,
    MeshQualifiers.PATHOLOGY,
    MeshQualifiers.METHODS,
    MeshQualifiers.THERAPY,
    MeshQualifiers.DIET_THERAPY,
    MeshQualifiers.REHABILITATION,
    MeshQualifiers.RADIOTHERAPY,
    MeshQualifiers.TRANSPLANTATION,
    MeshQualifiers.TRANSMISSION,
    MeshQualifiers.PHARMACOKINETICS,
  ],
  physiology: [
    MeshQualifiers.METABOLISM,
    MeshQualifiers.BLOOD,
    MeshQualifiers.ENZYMOLOGY,
    MeshQualifiers.PHYSIOLOGY,
    MeshQualifiers.PHYSIOPATHOLOGY,
    MeshQualifiers.ANATOMY_HISTOLOGY,
  ],
  statistics: [
    MeshQualifiers.ANALYSIS,
    MeshQualifiers.STATISTICS_NUMERICAL_DATA,
    MeshQualifiers.STANDARDS,
  ],
  all: Object.values(MeshQualifiers),
};