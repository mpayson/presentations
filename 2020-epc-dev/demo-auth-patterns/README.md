# Auth Patterns Demo
> A couple POC demos for validating users and accessing resources with ArcGIS

### ⚠ A disclaimer
These are quick demos to showcase the user experience flows from patterns we've seen implemented. Please do not take the implementations as authoritative references for your production systems and closely evaluate any approaches in the context of your security posture. Thanks and if you have any feedback, [drop a note](mailto:mpayson@esri.com)!

## App Patterns
> Access resources on behalf of the app

* **Online-hosted proxy** - use a proxy service to provide location services to users accessing your app [html](/2020-epc-dev/demo-auth-patterns/client/ags-auth-proxy)

## User Patterns
> Access resources on behalf of a user

* **Just use ArcGIS** - use ArcGIS to host and secure the services needed for your solution. [server-based routes](/2020-epc-dev/demo-auth-patterns/routes/use-ags-server.js) | [server-based html](/2020-epc-dev/demo-auth-patterns/client/use-ags-server.html) | [client-based html](/2020-epc-dev/demo-auth-patterns/client/use-ags-client.html)
* **Connect ArcGIS** - allow users to connect their ArcGIS account to your identity management system. [express routes](/2020-epc-dev/demo-auth-patterns/routes/connect-ags-unpw.js) | [html](/2020-epc-dev/demo-auth-patterns/client/connect-ags-unpw.html)
* **Trust ArcGIS** - write middleware to authenticate validated ArcGIS users in your identity management system. Learn more about the considerations under ["Access of a protected API as proof of authentication"](https://oauth.net/articles/authentication/)). [server-based express routes](/2020-epc-dev/demo-auth-patterns/routes/trust-ags-server.js) | [server-based html](/2020-epc-dev/demo-auth-patterns/client/trust-ags-server.html) | [client-based express routes](/2020-epc-dev/demo-auth-patterns/routes/trust-ags-client.js) | [client-based html](/2020-epc-dev/demo-auth-patterns/client/trust-ags-client.html)

## Other files

* [`memory-userstore.js`](/2020-epc-dev/demo-auth-patterns/models/memory-userstore) - an in-memory user store for validating and managing users (it's very bad practice, don't actually do this), but that could be abstracted to other identity management and access providers
* [`is-authorized.js`](/2020-epc-dev/demo-auth-patterns/middleware) - simple middleware to create protected routes for authorized users

## Running

1. `$ git clone https://github.com/mpayson/presentations.git`
2. `$ cd 2020-epc-dev/demo-auth-patterns`
3. `$ npm install`
4. Change the variables in [env.example](/2020-epc-dev/demo-auth-patterns/.env.example) and rename to .env
5. `$ npm start`

