# Auth Patterns Demo
> A couple POC demos for validating users and accessing resources with ArcGIS

### ⚠ A quick disclaimer
These are quick POCs inferred from patterns we've seen implemented. Please closely evaluate the approaches in the context of your security posture and do not take the implementations as hardened or authoritative references for your production systems. Thanks and if you have any feedback, [drop a note](mailto:mpayson@esri.com)!

## App Patterns
> Access resources on behalf of the app

* **Online-hosted proxy** - use a proxy service to provide location services to users accessing your app [[html](/client/ags-auth-proxy)]

## User Patterns

> Access resources on behalf of a user

* **Just use ArcGIS** - use ArcGIS to host and secure the services needed for your solution [[html](/client/use-ags-client)]
* **Connect ArcGIS** - allow users to connect their ArcGIS account to your identity management system [[express routes](/routes/connect-ags-unpw.js) & [html](/client/connect-ags-unpw.html)]
* **Trust ArcGIS** - write middleware to authenticate validated ArcGIS users in your identity management system [[server-based express routes](/routes/trust-ags-server.js) & [server-based html](/client/trust-ags-server.html), [client-based express routes](/routes/trust-ags-client.js) & [client-based html](/client/trust-ags-client.html)]

## Other files

* [`memory-userstore.js`](/models/memory-userstore) - an in-memory user store for validating and managing users (it's very bad practice, don't actually do this), but that could be abstracted to other identity management and access providers
* [`is-authorized.js`](/middleware) - simple middleware to create protected routes for authorized users

## Running

1. `$ git clone https://github.com/mpayson/presentations.git`
2. `$ cd 2020-epc-dev/demo-auth-patterns`
3. `$ npm install`
4. Change the variables in [env.example](/.env.example) and rename to .env
5. `$ npm start`

