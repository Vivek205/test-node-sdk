# Making Concurrent Calls with Image Segmentation

## Config

- create a new file `.env` in the root directory and copy the contents of `.env.example` into it. 
    ```bash
    cp .env.example .env
    ```
- Fill the `.env` file with the appropriate values
    - `PRIVATE_KEY` Private key of the account used to run the application
    - `SIGNER_PRIVATE_KEY` Private key to be used for signing (Use the same private key as above)
    - `NETWORK_ID` Appropriate id of the blockchain network. e.g. `1` for mainnet, `3` for ropsten
    - `PROVIDER_HOST` Infura endpoint (based on the network entered above)
    - `IPFS_ENDPOINT` IPFS endpoint where the service and org metadata are hosted (http://ipfs.singularitynet.io:80)
    - `DEFAULT_GAS_PRICE` Default gas price to be considered if not calculated (4700000)
    - `DEFAULT_GAS_LIMIT` Default gas limit to be considered if not calculated (210000)
    - `FREE_CALL_TOKEN` Download the freecall token from install&run tab of the service in the singularity marketplace  
        !Note: don't pass free call token if you're making concurrent calls  
        !Note: Freecall doesn't support concurrency  
    - `TOKEN_EXPIRATION_BLOCK` Downloaded along with the freecall token
    - `EMAIL` Email account used to download the freecall token

- `!important` Make sure to privide the number of calls you wish to run concurrently while initializing the payment strategy. 
We have used a default value of 8 for it. 
```node
const paymentStrategy = new DefaultPaymentStrategy(numberOfConcurrentCalls)
```

## Running the application
Install the required dependencies with
```bash
npm i
```
Customize the application as per your needs. Save it and run 
```bash
npm start
```
If you want to rerun the application without any new changes. Run
```bash
npm run reload
```

## Output
You will find the output files in the `./output` directory. 

## Using the application for a different service
This application is developed to run concurrent calls on [Real time voice cloning](https://beta.singularitynet.io/servicedetails/org/snet/service/real-time-voice-cloning). Nevertheless, you can still customize the application to run a different service. Follow the below steps for the same  
- Change the orgId and serviceId in the main method in index.js file. 
- Generate and paste the nodejs stub files from the proto of the service into ./proto folder
  - prerequisite: [install snet-cli](https://github.com/singnet/snet-cli#getting-started)  
  ```bash
  snet sdk nodejs org_id service_id ./proto
  ```
  replace the `org_id` and `service_id` with the actual organization id and service id respectively.
- You can import the stub files and customize your request and parse your response accordingly.