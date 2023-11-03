import { DataServices, isVocabPropDef } from "mykomap/app/model/data-services";
import { Initiative } from "mykomap/app/model/initiative";
import { PhraseBook } from "mykomap/localisations";

function getAddress(initiative: Initiative, getTerm: (prop: string) => string, labels: PhraseBook) {
  // We want to add the whole address into a single para
  // Not all orgs have an address
  let address = "";
  let street;
  if (typeof initiative.street === 'string') {
    let streetArray = initiative.street.split(";");
    for (let partial of streetArray) {
      if (partial === initiative.name) continue;
      if (street) street += "<br/>";
      street = street ? (street += partial) : partial;
    }
    address += street;
  }
  if (initiative.locality) {
    address += (address.length ? "<br/>" : "") + initiative.locality;
  }
  if (initiative.region) {
    address += (address.length ? "<br/>" : "") + initiative.region;
  }
  if (initiative.postcode) {
    address += (address.length ? "<br/>" : "") + initiative.postcode;
  }
  if (initiative.countryId) {
    const countryName = getTerm('countryId');
    address += (address.length ? "<br/>" : "") + (countryName || initiative.countryId);
  }
  if (initiative.nongeo == 1 || !initiative.lat || !initiative.lng) {
    address += (address.length ? "<br/>" : "") + `<i>${labels.noLocation}</i>`;
  }
  if (address.length) {
    address = '<p class="sea-initiative-address">' + address + "</p>";
  }
  return address;
}

function getWebsite(initiative: Initiative) {
  // Initiative's website. Note, not all have a website.
  if (initiative.www)
    return `<a href="${initiative.www}" target="_blank" >${initiative.www}</a>`;
  return '';
}


function getEmail(initiative: Initiative) {
  // Not all orgs have an email
  if (initiative.email)
    return `<a class="fa fa-at" href="mailto:${initiative.email}" target="_blank" ></a>`;
  return "";
}

function getFacebook(initiative: Initiative) {
  // not all have a facebook
  if (initiative.facebook)
    return `<a class="fab fa-facebook" href="https://facebook.com/${initiative.facebook}" target="_blank" ></a>`;
  return "";
}

function getTwitter(initiative: Initiative) {
  // not all have twitter
  if (initiative.twitter)
    return `<a class="fab fa-twitter" href="https://twitter.com/${initiative.twitter}" target="_blank" ></a>`;
  return '';
}

export function getPopup(initiative: Initiative, dataservices: DataServices) {
  const vocabs = dataservices.getVocabs();
  const lang = dataservices.getLanguage();
  const labels = dataservices.getFunctionalLabels();
  
  function getTerms(propertyName: string): string[] {
    const propDef = dataservices.getPropertySchema(propertyName);
    const propVal = initiative[propertyName];
    if (isVocabPropDef(propDef)) {
      if (propDef.type === 'multi' && propVal instanceof Array) {
        return propVal.map((val:unknown) => vocabs.getTerm(String(val), lang));
      }
      if (typeof propVal === 'string')
        return [vocabs.getTerm(propVal, lang)];
      if (propVal === undefined)
        return [labels.notAvailable];
      throw new Error(`invalid vocab property value for ${propertyName}: ${propVal}`);
    }
    throw new Error(`can't get term for non-vocab property ${propertyName}`);
  }
  
  function getTerm(propertyName: string, defaultVal?: string): string {
    const vals = getTerms(propertyName);
    if (vals.length > 0)
      return vals[0];
    if (defaultVal !== undefined)
      return defaultVal;
    return labels.notAvailable;
  }

  function getTitleVal(propertyName: string, title: string, defaultVal?: string) {
    const propVal = initiative[propertyName];
    if (defaultVal === null)
      defaultVal = labels.notAvailable;
    let val = defaultVal;
    if (typeof propVal === 'string') {
      val = propVal;
    }
    return `${title}: ${val}`;
  }
  function getTitleTerm(propertyName: string, title: string, defaultVal?: string) {
    if (defaultVal === null)
      defaultVal = labels.notAvailable;
    let val = defaultVal;
    const propDef = dataservices.getPropertySchema(propertyName);
    const propVal = initiative[propertyName];
    if (propDef.type === 'multi') {
      if (propVal instanceof Array)
        val = propVal.map((v: unknown) => vocabs.getTerm(String(v), lang, defaultVal)).join(', ');
      else
        val = defaultVal;
    }
    else {
      if (typeof propVal === 'string')
        val = vocabs.getTerm(propVal, lang, defaultVal);
      else
        val = defaultVal;
    }
    return `${title}: ${val}`;
  }

  let popupHTML = `
    <div class="sea-initiative-details">
	    <h2 class="sea-initiative-name">${initiative.name}</h2>
	    ${getWebsite(initiative)}
	    <h4 class="sea-initiative-cuk-sector">${getTitleVal('cukSector', 'Sector (Co-ops UK)')}</h4>
	    <h4 class="sea-initiative-sic-section">${getTitleVal('sicSection', 'SIC Section')}</h4>
	    <h4 class="sea-initiative-base-membership-type">${getTitleTerm('baseMembershipType', 'Base Membership Type')}</h4>
	    <h4 class="sea-initiative-org-structure">${getTitleTerm('orgStructure', 'Organisational Structure')}</h4>
	    <h4 class="sea-initiative-economic-activity">${getTitleTerm('primaryActivity', 'Primary Activity')}</h4>
      <p>${initiative.desc || ''}</p>
    </div>
    
    <div class="sea-initiative-contact">
      <h3>${labels.contact}</h3>
      ${getAddress(initiative, getTerm, labels)}
      
      <div class="sea-initiative-links">
        ${getEmail(initiative)}
        ${getFacebook(initiative)}
        ${getTwitter(initiative)}
      </div>
    </div>
  `;

  return popupHTML;
};

