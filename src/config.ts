// Re-export of ConfigData in mykomap/index above seems not to work,
// so import it directly from here:
import { ConfigData } from  "mykomap/app/model/config-schema";
import type {
  PropDef
} from "mykomap/app/model/data-services";
import {
  DataVal,
  mkObjTransformer,
  Transforms as T,
} from "mykomap/obj-transformer";
import * as versions from "./version.json";

import about from "./about.html";
import { getPopup } from './popup';
import { InitiativeObj } from "mykomap/app/model/initiative";

const baseUri = 'https://lod.coop/coops-uk/';

const rowToObj = mkObjTransformer<Record<string, DataVal>, InitiativeObj>({
  uri: T.prefixed(baseUri).from('Identifier'),
  name: T.text('').from('Name'),
  lat: T.nullable.number(null).from('Latitude'),
  lng: T.nullable.number(null).from('Longitude'),
  manLat: T.nullable.number(null).from('Geo Container Latitude'),
  manLng: T.nullable.number(null).from('Geo Container Longitude'),
  desc: T.text('').from('Description'),
  orgStructure: T.nullable.text(null).from('Organisational Structure'),
  primaryActivity: T.nullable.text(null).from('Primary Activity'),
  street: T.text('').from('Street Address'),
  locality: T.text('').from('Locality'),
  postcode: T.text('').from('Postcode'),
  www: T.nullable.text(null).from('Website'),
  chNum: T.nullable.text(null).from('Companies House Number'),
  baseMembershipType: T.nullable.text(null).from('Membership Type'),
  within: T.nullable.text(null).from('Geo Container'),
  cukSector: T.text('Unspecified').from('Sector'),
  sicSection: T.nullable.text(null).from('SIC Section'),
  sicCode: T.nullable.number(null).from('SIC Code'),
});


type Dictionary<T> = Partial<Record<string, T>>;
type FieldsDef = Dictionary<PropDef | 'value' >;
const fields: FieldsDef = {
  desc: 'value',
  www: 'value',
  street: 'value',
  locality: 'value', // FIXME need way to provide localisations for value fields    
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
    type: 'vocab',
    uri: 'os:',
    from: 'orgStructure',
  },
  cukSector: 'value',
  sicSection: 'value',
  confidence: 'value',
  geocodedAddr: 'value',
};


export const config: ConfigData = new ConfigData({
  namedDatasets: ['coops-uk'],
  htmlTitle: 'Co-ops UK',
  fields: fields,
  filterableFields: [
    //'cukSector', 'sicSection',
    'primaryActivity', 'orgStructure', 'baseMembershipType', //'locality'
  ],
  searchedFields: [
    'name', 'street', 'locality', 'postcode', 'description', 'www',
  ],
  languages: ['EN', 'FR', 'ES', 'KO'],
  language: 'EN',
  vocabularies: [
    {
      type: 'json',
      id: 'essglobal',
      label: 'ESSGLOBAL 2.1',
      url: 'https://data.digitalcommons.coop/coops-uk/vocabs.json',
    }
  ],
  dataSources: [
    {
      id: 'coops-uk2',
      label: 'Coops UK 2',
      type: 'csv',
      url: 'https://data.digitalcommons.coop/coops-uk/standard.csv',
      transform: rowToObj,
    },
  ],
  defaultLatLng: [52.476, -5.449],
  showDatasetsPanel: false,
  customPopup: getPopup,
  aboutHtml: about,
  ...versions,
});
