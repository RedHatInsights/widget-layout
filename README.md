# widget-layout
Reusable drag and drop UI layout for frontends

## Initial etc/hosts setup

In order to access the https://[env].foo.redhat.com in your browser, you have to add entries to your `/etc/hosts` file. This is a **one-time** setup that has to be done only once (unless you modify hosts) on each machine.

To setup the hosts file run following command:
```bash
npm run patch:hosts
```

If this command throws an error run it as a `sudo`:
```bash
sudo npm run patch:hosts
```

## Getting started

1. ```npm install```

2. ```npm run start```

3. Open browser in URL listed in the terminal output

4. Currently, `App.tsx` will throw a type error until your app is registered and a `navId` has been set

Update `config/dev.webpack.config.js` according to your application URL. [Read more](https://github.com/RedHatInsights/frontend-components/tree/master/packages/config#useproxy).

### Testing

`npm run verify` will run `npm run lint` (eslint) and `npm test` (Jest)

### Run locally with chrome service BE

!Prerequisites!
Podman, podman-compose and go (ideally [gvm](https://github.com/moovweb/gvm)) installed

1. Pull [chrome-services repository](https://github.com/RedHatInsights/chrome-service-backend)
2. Run `make infra` in chrome-services repository
3. Create .env file and copy default values as mentioned in [chrome-service-backend#local-testing](https://github.com/RedHatInsights/chrome-service-backend?tab=readme-ov-file#local-testing) in chrome-services repository
4. Run `go run main.go` in chrome-services repository
5. Run `CONFIG_PORT=8000 npm run start` in widget-layout reposiroty
