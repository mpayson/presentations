# Extend ArcGIS Demo
> A custom, demo enrichment service that integrates with ArcGIS and extends user's deployments

This demo shows two extension patterns, a Pro GeoProcessing (GP) tool and web application built with the ArcGIS API for JavaScript, in the context of a customm enrichment service. For data providers, it also shows a pattern for creating a data request and delivery experience that plugs into the ArcGIS ecosystem. Both the GP tool and app allow users to receive weather warnings for selected areas of interest and a selected certainty category.

## Running

Get the source code
1. `$ git clone https://github.com/mpayson/presentations.git`
2. `$ cd 2020-epc-dev/demo-extend-arcgis`

Start the server
1. `$ cd server`
2. `$ npm install`
3. Update [`.env.example`](/2020-epc-dev/demo-extend-arcgis/server/.env.example) and rename to `.env`
4. `$ npm start`

Start the web app (proxies to the server)
1. `$ cd web-client`
2. `$ yarn install`
3. (optional) update [`environment.js`](/2020-epc-dev/demo-extend-arcgis/web-client/src/config/environment.js) with an App ID
4. `$ yarn start`

Use the Pro Toolbox
1. Update the API_BASE_URL to your server URL in `pro-gp-client/demo-extend-arcgis.pyt`
2. Follow the [directions here](https://pro.arcgis.com/en/pro-app/help/analysis/geoprocessing/basics/use-a-custom-geoprocessing-tool.htm)




