# Screenlife Capture Tagging Platform

## Running Locally
Here are the instructions if you would like to try / use the platform on your own local device. Please note that the process requires some knowledge of running commands on a command-line interface, including using `git` (optional), and `npm`, and `node`.

If you don't have at least `npm` and `node` installed, please do so before peforming the steps below. There are many guides / videos online on how to do so on your specific OS, such as [this](https://positiwise.com/blog/how-to-install-npm-and-node-js-on-mac-and-windows).

To run the platform locally, please follow these steps:

1. Download this repo, either through `git clone` or downloading it as a zip file (and extract it).
2. Open Terminal / CMD, and navigate to the repo folder (upon `ls` or `dir`, you should see the `server`, `shared`, and `webapp` folders).
3. Install the needed dependencies, by running the following commands:
```
npm install --prefix server
npm install --prefix webapp
```
4. Create the local database using the following command:
```
npm run migrate --prefix server
```
5. Prepare the images and update the configurations, referring to the instructions [here](./server/readme.md).
6. Run the following commands to start the server, and the webapp respectively. (You probably would want to do this in two separate terminals!)
```
npm run dev --prefix server
npm run dev --prefix webapp
```
> When you run the server for the first time, the server will create a new admin user, and output the email / password combination. Be sure to record these down somewhere.
7. Install [CORS Unblock](https://chromewebstore.google.com/detail/cors-unblock/lfhmikememgdcahcdlaciloancbhjino). This Chrome extensions allows you the webapp to talk to the local server. Please note that this should only be enabled when using the platform, and disabled during normal browsing.
> Note, this step may not be required in the near future.
8. Open the webapp on your browser, at `http://localhost:3000/login`, and login using the credentials above.