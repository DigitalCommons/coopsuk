import type { DataServices } from "mykomap/app/model/data-services";
import type { Vocab } from "mykomap/app/model/vocabs";
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

function getBMT(initiative: Initiative, bmtVocab: Vocab) {
  if (typeof initiative.baseMembershipType === 'string') {
    return `${bmtVocab.title}: ${bmtVocab.terms[initiative.baseMembershipType]}`;
  }

  return `${bmtVocab.title}: Others`;
}

function getOrgStructure(initiative: Initiative, osVocab: Vocab, qfVocab: Vocab) {
  if (!initiative.qualifier && typeof initiative.orgStructure === 'string') {
    const term = osVocab.terms[initiative.orgStructure];
    return `${osVocab.title}: ${term}`;
  }

  if (!initiative.qualifier && typeof initiative.regorg === 'string') {
    if (!osVocab.terms[initiative.regorg])
      console.error(`Unknown ${osVocab.title} vocab term ID: ${initiative.regorg}`);
    return `${osVocab.title}: ${osVocab.terms[initiative.regorg]}`;
  }

  if (typeof initiative.qualifier === 'string') {
    if (!qfVocab.terms[initiative.qualifier]) {
      qfVocab.terms[initiative.qualifier] = "unknown";
      console.error(`Unknown ${qfVocab.title} vocab term ID: ${initiative.qualifier}`);
    }

    return `${osVocab.title}: ${qfVocab.terms[initiative.qualifier]}`;
  }

  return '';
}

function getPrimaryActivity(initiative: Initiative, acVocab: Vocab) {
  if (typeof initiative.primaryActivity === 'string' && initiative.primaryActivity != "") {
    return `Main Activity: ${acVocab.terms[initiative.primaryActivity]}`;
  }

  return '';
}

function getSecondaryActivities(initiative: Initiative, acVocab: Vocab, labels: PhraseBook) {
  const title = labels.secondaryActivities;

  if (initiative.activities instanceof Array && initiative.activities.length > 0) {
    const term = initiative.activities.map((id: unknown) => acVocab.terms[String(id)]).join(", ");
    return `${title}: ${term}`;
  }

  return '';
}

function getCukSector(initiative: Initiative, labels: PhraseBook) {
  const title = 'Sector (Coops UK)';

  if (initiative.cukSector) {
    return `${title}: ${initiative.cukSector}`;
  }

  return '';
}

function getSicSection(initiative: Initiative, labels: PhraseBook) {
  const title = 'SIC Section';

  if (initiative.sicSection) {
    return `${title}: ${initiative.sicSection}`;
  }

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

export function getPopup(initiative: Initiative, sse_initiatives: DataServices) {
  function getTerm(propertyName: string) {
    const propDef = sse_initiatives.getPropertySchema(propertyName);
    const term = initiative[propertyName];
    if (typeof term !== 'string')
      throw new Error(`non-string value for property ${propertyName}`);  
    if (propDef.type === 'vocab') {
      const vocabUri = propDef.uri;
      return sse_initiatives.getVocabTerm(vocabUri, term);
    }
    throw new Error(`can't get term for non-vocab property ${propertyName}`);
  }

  const values = sse_initiatives.getLocalisedVocabs();
  const labels = sse_initiatives.getFunctionalLabels();
  let popupHTML = `
    <div class="sea-initiative-details">
	    <h2 class="sea-initiative-name">${initiative.name}</h2>
	    ${getWebsite(initiative)}
	    <h4 class="sea-initiative-cuk-sector">${getCukSector(initiative, labels)}</h4>
	    <h4 class="sea-initiative-sic-section">${getSicSection(initiative, labels)}</h4>
	    <h4 class="sea-initiative-base-membership-type">${getBMT(initiative, values["bmt:"])}</h4>
	    <h4 class="sea-initiative-org-structure">${getOrgStructure(initiative, values["os:"], values["qf:"])}</h4>
	    <h4 class="sea-initiative-economic-activity">${getPrimaryActivity(initiative, values["aci:"])}</h4>
      <h5 class="sea-initiative-secondary-activity">${getSecondaryActivities(initiative, values["aci:"], labels)}</h5>
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

