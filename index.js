
/**
 * dotenv must be on the top of the entry file of the project
 */
require("dotenv").config();

import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";
import service from "./proto/example_service_grpc_pb";
import messages from "./proto/example_service_pb";
import config from "./config";
import cluster from "cluster";



const sdk = new SnetSDK(config);

var numbers = new messages.Numbers();

const main = async (firstNumber, secondNumber) => {
  const orgId = "6ce80f485dae487688c3a083688819bb";
  const serviceId = "test_freecall";
  const groupName = "default_group";
  const paymentStrategy = new DefaultPaymentStrategy(2);

  const serviceClientOptionsFreeCall = {
    email: process.env.EMAIL,
    // generated from marketplace 
    tokenToMakeFreeCall: process.env.FREE_CALL_TOKEN.toUpperCase(),
    // generated from marketplace 
    tokenExpirationBlock: Number(process.env.TOKEN_EXPIRATION_BLOCK),
    disableBlockchainOperations: false,
    concurrency: true,
  };

  numbers.setA(firstNumber);
  numbers.setB(secondNumber);
  console.log("config",config)
  console.log("numbers set", serviceClientOptionsFreeCall);

  const closeConnection = () => {
    sdk.web3.currentProvider.connection && sdk.web3.currentProvider.connection.close();
  };

  const responseHandler = (resolve, reject) => (err, result) => {
    if (err) {
      console.log("GRPC call failed");
      console.error(err);
      closeConnection();
      reject(err);
    } else {
      console.log("Result:", result.getValue());
      console.log("<---------->");
      resolve(result);
    }
  };

  try {
    console.log("init service client")
    const serviceClient = await sdk.createServiceClient(
      orgId,
      serviceId,
      service.CalculatorClient,
      groupName,
      paymentStrategy,
      serviceClientOptionsFreeCall
    );
    console.log("service client created success!");

    await new Promise((resolve, reject) => {
      console.log(`Performing ${firstNumber} + ${secondNumber}`);
      serviceClient.service.add(numbers, responseHandler(resolve, reject));
    });

    await new Promise((resolve, reject) => {
      console.log(`Performing ${firstNumber} - ${secondNumber}`);
      serviceClient.service.sub(numbers, responseHandler(resolve, reject));
    });

    await new Promise((resolve, reject) => {
      console.log(`Performing ${firstNumber} * ${secondNumber}`);
      serviceClient.service.mul(numbers, responseHandler(resolve, reject));
    });

    await new Promise((resolve, reject) => {
      console.log(`Performing ${firstNumber} / ${secondNumber}`);
      serviceClient.service.div(numbers, responseHandler(resolve, reject));
    });
    closeConnection();
  } catch (error) {
    console.log("promise error", error);
    closeConnection();
  }
};

main(6, 7);
