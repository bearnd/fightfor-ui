/**
 * Returns an object specifying the icon and name of a MeSH descriptor based on
 * its tree-number.
 * @param treeNumber The tree-number of the MeSH descriptor.
 */
export function getDescriptorIconClass(treeNumber: string): {
  iconClass: string, category: string
} {
  if (treeNumber.startsWith('A')) {
    return {iconClass: 'fa-child', category: 'Anatomy'};
  } else if (treeNumber.startsWith('B')) {
    return {iconClass: 'fa-frog', category: 'Organisms'};
  } else if (treeNumber.startsWith('C')) {
    return {iconClass: 'fa-allergies', category: 'Diseases'};
  } else if (treeNumber.startsWith('D')) {
    return {iconClass: 'fa-capsules', category: 'Chemicals and Drugs'};
  } else if (treeNumber.startsWith('E')) {
    return {
      iconClass: 'fa-chart-bar',
      category: 'Analytical, Diagnostic and Therapeutic Techniques, and ' +
        'Equipment ',
    };
  } else if (treeNumber.startsWith('F')) {
    return {iconClass: 'fa-brain', category: 'Psychiatry and Psychology'};
  } else if (treeNumber.startsWith('G')) {
    return {
      iconClass: 'fa-book-medical',
      category: 'Phenomena and Processes',
    };
  } else if (treeNumber.startsWith('H')) {
    return {
      iconClass: 'fa-briefcase-medical',
      category: 'Disciplines and Occupations',
    };
  } else if (treeNumber.startsWith('I')) {
    return {
      iconClass: 'fa-user-graduate',
      category: 'Anthropology, Education, Sociology, and Social Phenomena',
    };
  } else if (treeNumber.startsWith('J')) {
    return {
      iconClass: 'fa-laptop-code',
      category: 'Technology, Industry, and Agriculture',
    };
  } else if (treeNumber.startsWith('K')) {
    return {
      iconClass: 'fa-book-reader',
      category: 'Humanities',
    };
  } else if (treeNumber.startsWith('L')) {
    return {
      iconClass: 'fa-database',
      category: 'Information Science',
    };
  } else if (treeNumber.startsWith('M')) {
    return {
      iconClass: 'fa-user-tag',
      category: 'Named Groups',
    };
  } else if (treeNumber.startsWith('N')) {
    return {
      iconClass: 'fa-hand-holding-heart',
      category: 'Health Care',
    };
  } else if (treeNumber.startsWith('V')) {
    return {
      iconClass: 'fa-tags',
      category: 'Publication Characteristics',
    };
  } else if (treeNumber.startsWith('Z')) {
    return {
      iconClass: 'fa-map-marker-alt',
      category: 'Geographicals',
    };
  }
}
