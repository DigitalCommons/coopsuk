# playground

Test / development project which uses the SEA's `sea-map` NPM module.

## Building

    npm install    # pulls in dependencies
	npm run build  # builds the website

This should result in the built site being written to `build/out`.

## Components

- `package.json`: npm package definition
- `package-lock.json`: npm version lock file (ensures consistent deployment)
- `config/*`: assets to be included in the site `/configuration/` directory
  - `about.html`: defines content of the "about" pop-up
  - `config.json`: configuration for the sea-map component 
  - `<datasource name>/`: configurations for particular SPARQL data queries
    - `default-graph-uri.txt`: the SPARQL default graph URI
	- `endpoint.txt`: the SPARQL endpoint
	- `query.rg`: the default SPARQL query
	- `*.rq`: optional supplemental queries
- `src/*`: other local supplemental assets adding to or overriding sea-map assets in '/'

Transient components:
- `config/version.json`: version and timestamp info created when building
- `build/in/`: input directory fed to Require.js compiler
- `build/out/`: output directory where finished site files written


## Development tools

    npm run dev
	
Assuming you have `php-cli` installed, this will run a development
server locally and you will be able to view the built website at
`http://localhost:8080`. Note. it required the sparql endpoint(s) to
be accessible.

## Deploying

First, you need to configure the host to deploy to.  Set the
`playground:deploy_to` config [parameter appropriately like this:

    npm config set playground:deploy_to example.com:/var/www/playground
	
Obviously you should substitute whatever URL makes sense for your
deployment. Anything `rsync` understands as a destination URL will
work.  Note, the deployment will not work if you don't do this.

You can also change the default user and group to deploy as from
`www-data` by setting the config parameters `playground:deploy_user`
and `playground:deploy_group` in a similar way.

If you need to check the current setting, this will show you:

    npm config get playground:deploy_to

Remember to put the right prefix in front of the variable. It should 
match the project name defined in `package.json`, so in this case is 
`playground`, but if you're doing this in another project it won't be.

A script for building, deploying and setting versions is available as well. 
It will set the version and build and deploy for you 
for faster development. To use this run (this will just build and deploy the map to 
the dev server (specified in deploy_targets/dev)): 
        ./deploy_targets/configdeploy.sh
This will deploy the current version of the map to the dev server (dev by default)
You can also provide arguments for the script to change versions and deploy to the production server.
The first argument provided to the configdeploy.sh is the sea-map version
The second argument is the configuration script (dev/prod) in the deploy_targets folder.
        ./deploy_targets/configdeploy.sh 0.1.25 dev
you can also leave out the second argument, it will default to the dev script.
        ./deploy_targets/configdeploy.sh 0.1.25

### ssh keys etc.

Depending on the deployment URL you've chosen, you may need to set up
ssh key access for the target server in `~/.ssh/config` and on the
server itself. 

See the manual for `rsync` and `ssh_config` for a more detailed
background.

