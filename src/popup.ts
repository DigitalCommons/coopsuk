import { DataServices, isVocabPropDef } from "mykomap/app/model/data-services";
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

  function getTerm(propertyName: string) {
    const propDef = dataservices.getPropertySchema(propertyName);
    const propVal = initiative[propertyName];
    if (isVocabPropDef(propDef)) {
      if (typeof propVal === 'string')
        return vocabs.getTerm(propVal, lang);
      if (propVal === undefined)
        return labels.notAvailable;
      throw new Error(`invalid vocab property value for ${propertyName}: ${propVal}`);
    }
    throw new Error(`can't get term for non-vocab property ${propertyName}`);
  }
  function getValue(propertyName: string) {
    if (propertyName in initiative) {
      const propVal = initiative[propertyName];
      if (propVal === undefined)
        return labels.notAvailable;
      return propVal;
    }
    throw new Error(`can't get value for non-existant property ${propertyName}`);
  }

  let popupHTML = `
    <div class="sea-initiative-details">
	    <h2 class="sea-initiative-name">${initiative.name}</h2>
	    ${getWebsite(initiative)}
      <h4>Sector (Coops UK): ${getValue('cukSector')}</h4>
      <h4>SIC Section: ${getValue('sicSection')}</h4>
      <h4>${vocabs.getVocab('bmt:', lang).title}: ${getTerm('baseMembershipType')}</h4>
      <h4>${vocabs.getVocab('os:', lang).title}: ${getTerm('orgStructure')}</h4>
      <h4>${vocabs.getVocab('aci:', lang).title}: ${getTerm('primaryActivity')}</h4>
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
