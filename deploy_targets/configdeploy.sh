
#: ${1?"Usage: $0 NO VERSION ARGUMENT"}
if echo "$1" | grep "[0-9]\+\.[0-9]\+\.[0-9]\+"
then
        echo creating and uploading sea-map with version $1
        sed -i "s/semver:\^[[:digit:]]\+\.[[:digit:]]\+\.[[:digit:]]\+\"/semver:\^$1\"/" package.json
else
	echo No Version, Deploying current version without changing
fi

rm -r node_modules/
npm update
npm install
npm run build

if [ "$2" == "dev" ]; then
        ./deploy_targets/$2
elif [ "$2" == "prod" ]; then
        ./deploy_targets/$2
else
        echo No server target can be dev/prod, deploying to dev
        ./deploy_targets/dev
fi

npm run deploy