const x = {
  a: 'b',
  c: 'd'
}

delete x.c;

console.log(x);


// LYR_URL = 'https://services9.arcgis.com/RHVPKKiFTONKtxq3/arcgis/rest/services/NWS_Watches_Warnings_v1/FeatureServer/6';
// async function getLyrGeojson(lyrUrl){
//   // for now assume less than max records returned
//   // and just need one query
//   const geojson = await queryFeatures({
//     url: lyrUrl,
//     where: "1=1",
//     outFields: "*",
//     f: "geojson"
//   })
//   .catch(er => console.log(er));
//   console.log(geojson);
// }

// getLyrGeojson(LYR_URL);

// https://www.arcgis.com/sharing/rest/oauth2/authorize?client_id=YfFEWoHwtOY4KP1t&duration=20160&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fpost-sign-in