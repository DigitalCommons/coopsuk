import type { DataServices } from "mykomap/app/model/dataservices";
import type { Dictionary } from 'mykomap/common_types';
import type { Vocab } from "mykomap/app/model/vocabs";
import type { Initiative } from "mykomap/app/model/initiative";

function getAddress(initiative: Initiative, getTerm: (prop: string) => string, labels: Dictionary<string>) {
  // We want to add the whole address into a single para
  // Not all orgs have an address
  let address: string = "";
  let street: string;
  const _street = initiative.street;
  if (typeof _street === 'string') {
    let streetArray = _street.split(";");
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
  const bmt = initiative.baseMembershipType;
  if (typeof bmt === 'string') {
    return `${bmtVocab.title}: ${bmtVocab.terms[bmt]}`;
  }

  return `${bmtVocab.title}: Others`;
}

function getOrgStructure(initiative: Initiative, osVocab: Vocab, acVocab: Vocab, qfVocab: Vocab) {
  const qualifier = initiative.qualifier;
  const orgStructure = initiative.orgStructure;
  const regorg = initiative.regorg;
  if (!qualifier && typeof orgStructure === 'string' && orgStructure.length > 0) {
    const term = osVocab.terms[orgStructure];
    return `${osVocab.title}: ${term}`;
  }

  if (!qualifier && typeof regorg === 'string') {
    if (!osVocab.terms[regorg])
      console.error(`Unknown ${osVocab.title} vocab term ID: ${regorg}`);
    return `${osVocab.title}: ${osVocab.terms[regorg]}`;
  }

  if (typeof qualifier === 'string') {
    if (!qfVocab.terms[qualifier]) {
      qfVocab.terms[qualifier] = "unknown";
      console.error(`Unknown ${qfVocab.title} vocab term ID: ${qualifier}`);
    }

    return `${osVocab.title}: ${qfVocab.terms[qualifier]}`;
  }

  return '';
}

function getPrimaryActivity(initiative: Initiative, acVocab: Vocab) {
  const primaryActivity = initiative.primaryActivity;
  if (typeof primaryActivity === 'string' && primaryActivity != "") {
    return `Main Activity: ${acVocab.terms[primaryActivity]}`;
  }

  return '';
}

function getSecondaryActivities(initiative: Initiative, acVocab: Vocab, labels: Dictionary<string>) {
  const title = labels.secondaryActivities;
  const activities = initiative.activities;
  if (activities instanceof Array && activities.length > 0) {
    const term = activities
      .filter((id): id is string => typeof id === 'string')
      .map((id: string) => acVocab.terms[id]).join(", ");
    return `${title}: ${term}`;
  }

  return '';
}

function getCukSector(initiative: Initiative, labels: Dictionary<string>) {
  const title = 'Sector (Coops UK)';
  const cukSector = initiative.cukSector;
  if (typeof cukSector === 'string') {
    return `${title}: ${cukSector}`;
  }

  return '';
}

function getSicSection(initiative: Initiative, labels: Dictionary<string>) {
  const title = 'SIC Section';
  const sicSection = initiative.sicSection;
  if (typeof sicSection === 'string') {
    return `${title}: ${sicSection}`;
  }

  return '';
}

function getEmail(initiative: Initiative) {
  // Not all orgs have an email
  const email = initiative.email;
  if (typeof email === 'string')
    return `<a class="fa fa-at" href="mailto:${email}" target="_blank" ></a>`;
  return "";
}

function getFacebook(initiative: Initiative) {
  // not all have a facebook
  if (typeof initiative.facebook === 'string')
    return `<a class="fab fa-facebook" href="https://facebook.com/${initiative.facebook}" target="_blank" ></a>`;
  return "";
}

function getTwitter(initiative: Initiative) {
  // not all have twitter
  if (typeof initiative.twitter === 'string')
    return `<a class="fab fa-twitter" href="https://twitter.com/${initiative.twitter}" target="_blank" ></a>`;
  return '';
}

export function getPopup(initiative: Initiative, sse_initiatives: DataServices) {
  function getTerm(propertyName: string) {
    const propDef = sse_initiatives.getPropertySchema(propertyName);
    const val = initiative[propertyName];
    if (propDef.type === 'vocab' && typeof val === 'string') {
      const vocabUri = propDef.uri;
      return sse_initiatives.getVocabTerm(vocabUri, val);
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
	    <h4 class="sea-initiative-org-structure">${getOrgStructure(initiative, values["os:"], values["aci:"], values["qf:"])}</h4>
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

