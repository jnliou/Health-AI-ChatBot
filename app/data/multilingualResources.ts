// Multilingual STI Resources
// Source: SmartSexResource (BC Centre for Disease Control)
// Last verified: 2026-02-28

export interface LanguageResource {
  direct_pdf: string | null;
}

export interface STIResource {
  display: string;
  source_page: string;
  languages: Record<string, LanguageResource>;
  notes?: string;
}

export const MULTILINGUAL_RESOURCES: Record<string, STIResource> = {
  chlamydia: {
    display: 'Chlamydia',
    source_page: 'https://smartsexresource.com/resources/chlamydia-information-sheet/',
    languages: {
      'English': { direct_pdf: null }, // PDF URLs are not publicly accessible; users will access via source page
      'Arabic': { direct_pdf: null },
      'Chinese (Simplified)': { direct_pdf: null },
      'Farsi': { direct_pdf: null },
      'French': { direct_pdf: null },
      'Korean': { direct_pdf: null },
      'Punjabi': { direct_pdf: null },
      'Spanish': { direct_pdf: null }
    },
    notes: 'Information sheets available in 8 languages. Visit the resource page and select your language from the available translations.'
  },
  
  gonorrhea: {
    display: 'Gonorrhea',
    source_page: 'https://smartsexresource.com/resources/gonorrhea-information-sheet/',
    languages: {
      'English': { direct_pdf: null }, // PDF URLs are not publicly accessible; users will access via source page
      'Arabic': { direct_pdf: null },
      'Chinese (Simplified)': { direct_pdf: null },
      'Farsi': { direct_pdf: null },
      'French': { direct_pdf: null },
      'Korean': { direct_pdf: null },
      'Punjabi': { direct_pdf: null },
      'Spanish': { direct_pdf: null }
    },
    notes: 'Information sheets available in 8 languages. Visit the resource page and select your language from the available translations.'
  },
  
  syphilis: {
    display: 'Syphilis',
    source_page: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/syphilis/',
    languages: {
      'English': { direct_pdf: null },
      'Farsi': { direct_pdf: null } // PDF URLs are not publicly accessible; users will access via source page
    },
    notes: 'SSR provides English web content; only Farsi PDF is hosted by SSR via HealthLinkBC.'
  },
  
  hepatitis_b: {
    display: 'Hepatitis B',
    source_page: 'https://smartsexresource.com/resources/hepatitis-b-information-sheet/',
    languages: {
      'English': { direct_pdf: null }, // PDF URLs are not publicly accessible; users will access via source page
      'Arabic': { direct_pdf: null },
      'Chinese (Traditional)': { direct_pdf: null },
      'Farsi': { direct_pdf: null },
      'French': { direct_pdf: null },
      'Korean': { direct_pdf: null },
      'Punjabi': { direct_pdf: null },
      'Spanish': { direct_pdf: null },
      'Vietnamese': { direct_pdf: null }
    }
  },
  
  hiv_aids: {
    display: 'HIV & AIDS',
    source_page: 'https://smartsexresource.com/sexually-transmitted-infections/stis-conditions/hiv-and-aids/',
    languages: {
      'English': { direct_pdf: null }
    },
    notes: 'SSR lists an English PDF in the Resource Database; if needed, show the page and the PDF label to the user.'
  },
  
  hpv: {
    display: 'Human Papillomavirus (HPV)',
    source_page: 'https://smartsexresource.com/resources/hpv-information-sheet/',
    languages: {
      'English': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-English.pdf' },
      'Arabic': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-Arabic.pdf' },
      'Chinese (Simplified)': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-Chinese-Simplified.pdf' },
      'Farsi': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-Farsi.pdf' },
      'French': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-French.pdf' },
      'Korean': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-Korean.pdf' },
      'Punjabi': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-Punjabi.pdf' },
      'Spanish': { direct_pdf: 'https://smartsexresource.com/wp-content/uploads/resources/HPV-Info-Sheet-Spanish.pdf' }
    }
  }
};

export const UX_COPY = {
  prompt_language: 'Which language do you need?',
  cta_pdf: 'Open PDF',
  cta_page: 'Open official resource page',
  footnote: 'From SmartSexResource (BCCDC). Clinical content is updated periodically—use the latest official guidance.',
  disclaimer: 'If a direct PDF is not available for the requested language, we\'ll send you to the official SmartSexResource page where you can select your language.'
};

// Detect language from user query
export function detectLanguage(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('arabic') || lowerQuery.includes('عربي')) {
    return 'Arabic';
  } else if (lowerQuery.includes('chinese') && (lowerQuery.includes('simplified') || lowerQuery.includes('简体'))) {
    return 'Chinese (Simplified)';
  } else if (lowerQuery.includes('chinese') && (lowerQuery.includes('traditional') || lowerQuery.includes('繁體'))) {
    return 'Chinese (Traditional)';
  } else if (lowerQuery.includes('farsi') || lowerQuery.includes('persian') || lowerQuery.includes('فارسی')) {
    return 'Farsi';
  } else if (lowerQuery.includes('french') || lowerQuery.includes('français')) {
    return 'French';
  } else if (lowerQuery.includes('korean') || lowerQuery.includes('한국어')) {
    return 'Korean';
  } else if (lowerQuery.includes('punjabi') || lowerQuery.includes('ਪੰਜਾਬੀ')) {
    return 'Punjabi';
  } else if (lowerQuery.includes('spanish') || lowerQuery.includes('español')) {
    return 'Spanish';
  } else if (lowerQuery.includes('vietnamese') || lowerQuery.includes('tiếng việt')) {
    return 'Vietnamese';
  } else if (lowerQuery.includes('english')) {
    return 'English';
  }
  
  return null;
}

// Detect STI topic from user query
export function detectSTITopic(query: string): string | null {
  const lowerQuery = query.toLowerCase();
  
  if (lowerQuery.includes('chlamydia')) {
    return 'chlamydia';
  } else if (lowerQuery.includes('gonorrhea') || lowerQuery.includes('gonorrhoea')) {
    return 'gonorrhea';
  } else if (lowerQuery.includes('syphilis')) {
    return 'syphilis';
  } else if (lowerQuery.includes('hepatitis b') || lowerQuery.includes('hep b')) {
    return 'hepatitis_b';
  } else if (lowerQuery.includes('hiv') || lowerQuery.includes('aids')) {
    return 'hiv_aids';
  } else if (lowerQuery.includes('hpv') || lowerQuery.includes('papillomavirus')) {
    return 'hpv';
  }
  
  return null;
}

// Get multilingual resource for a topic and language
export function getMultilingualResource(
  topic: string, 
  language: string,
  resources: Record<string, STIResource> = MULTILINGUAL_RESOURCES
): {
  resource: STIResource;
  languageData: LanguageResource;
  hasDirectPDF: boolean;
} | null {
  const resource = resources[topic];
  if (!resource) return null;
  
  const languageData = resource.languages[language];
  if (!languageData) return null;
  
  return {
    resource,
    languageData,
    hasDirectPDF: languageData.direct_pdf !== null
  };
}

// Get all available languages for a topic
export function getAvailableLanguages(topic: string): string[] {
  const resource = MULTILINGUAL_RESOURCES[topic];
  if (!resource) return [];
  
  return Object.keys(resource.languages);
}