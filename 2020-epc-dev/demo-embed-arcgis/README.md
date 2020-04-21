# Embed ArcGIS Demo
> Multiple applications that progressively add ArcGIS capabilities

This demo shows a basic maintenance request workflow (generate routes between requests, later submit and triage requests) with multiple implementations based on the underlying ArcGIS technologies used. The single-page-app is built with the [ArcGIS API for JavaScript](https://developers.arcgis.com/javascript/) and uses various ArcGIS services.

## Apps

Location services:
* LbsWorkerApp: Load a GeoJSON with maintenance requests, render it on a map, and generate an optimal route between requests. Uses the JS API and hosted tile / routing services in Online

Infrastructure (adds hosted services with access controls / permissions based on users)
* UserRequestApp: Submit anonymous maintenance requests through an "add only" feature service (records can only be added, not deleted or queried)
* DispatchApp: Triage anonymous maintenance requests and assign them to workers
* WorkerApp: Same as LbsWorkerApp, but with the live services from submitted requests

Advanced capabilities (adds GeoEvent service to automatically assign requests to nearby workers)
* RealTimeRequestApp: Same as UserRequestApp but submits the request to GeoEvent
* RealTimeWorker: Same as WorkerApp, except requests were now added to the underlying service through GeoEvent

## Running

1. `$ git clone https://github.com/mpayson/presentations.git`
2. `$ cd 2020-epc-dev/demo-embed-arcgis`
3. Update `sr/config/environment.example.js` with your appId and rename
4. `$ yarn install`
5. `$ yarn start`