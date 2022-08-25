import { webRun, fetchConfigs} from "sea-map/index";

// Re-export of ConfigData in sea-map/index above seems not to work,
// so import it directly from here:
import type { ConfigData } from  "sea-map/app/model/config_schema";
import type {
  Initiative, DataServices, CustomPropDef, InitiativeObj
} from "sea-map/app/model/dataservices";
import { getAddress, getEmail, getTwitter } from "sea-map/app/view/map/default_popup";
import * as versions from "./version.json";

import about from "../config/about.html";
//import { getPopup } from './popup.js';

const config: ConfigData = {
  namedDatasets: ['coops-uk'],
  htmlTitle: 'Co-ops UK',
  fields: {
    desc: 'value',
    www: 'value',
    street: 'value',
    locality: 'value',    
    postcode: 'value',
    baseMembershipType: {
      type: 'vocab',
      uri: 'bmt:',
    },
    primaryActivity: {
      type: 'vocab',
      uri: 'aci:',
    },
    orgStructure: {
      type: 'multi',
      of: {
        type: 'vocab',
        uri: 'os:',
        from: 'regorg',
      },
    },
  },
  filterableFields: [
    'orgStructure', 'baseMembershipType', 'locality','primaryActivity'
  ],
  searchedFields: [
    'name', 'street', 'locality', 'postcode', 'description'
  ],
  languages: ['EN', 'FR', 'ES', 'KO'],
  language: 'EN',
  vocabularies: [
    { endpoint: 'http:\/\/dev.data.solidarityeconomy.coop:8890/sparql',
      defaultGraphUri: 'https://dev.lod.coop/coops-uk',
      uris: {
        'https:\/\/dev.lod.coop/essglobal/2.1/standard/activities-ica/': 'aci',
        'https:\/\/dev.lod.coop/essglobal/2.1/standard/base-membership-type/': 'bmt',
        'https:\/\/dev.lod.coop/essglobal/2.1/standard/organisational-structure/': 'os',
      }
    }
  ],
  showDatasetsPanel: true,
  aboutHtml: about,
  ...versions,
};

webRun(window, config);
