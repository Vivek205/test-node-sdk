/**
 * dotenv must be on the top of the entry file of the project
 */
require("dotenv").config();

import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";
import service from "./proto/example_service_grpc_pb";
import messages from "./proto/example_service_pb";
import config from "./config";

console.log("config", config);

const sdk = new SnetSDK(config);
var numbers = new messages.Numbers();

const main = async (firstNumber, secondNumber) => {
  const orgId = "6ce80f485dae487688c3a083688819bb";
  const serviceId = "test_freecall";
  const groupName = "default_group";
  const paymentStrategy = new DefaultPaymentStrategy(1);
  const serviceClientOptionsPaidCall = {
    // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall
    tokenToMakeFreeCall: "0X9acaaa2613ffd52e242695aaafabf1bb3619b0cca9068212958b5a2a3718d0ed0a008051b973e4af1d2049364d3734c9e1ea699922d933db8b258a5be3ad4ae51c".toUpperCase(),
    // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall,
    tokenExpirationBlock: 9342373,
    email: "freecallsdk@grr.la",
    disableBlockchainOperations: false,
    concurrency: true,
  };

  const serviceClientOptionsFreeCall = {
    email: "ichbinvivek@gmail.com",
    // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall
    tokenToMakeFreeCall: "0xb725820105485aaf19a5bc96d3f5a89b57b005b6de62ac388cc85d24434c03501462e5350aded04756cf094f017f65c627278c0cb65f012021f3c49141eb5f211c",
    // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall,
    tokenExpirationBlock: 9342672,
    disableBlockchainOperations: false,
    concurrency: true,
  };
  console.log("payment strategy --------------------------", paymentStrategy);
  numbers.setA(firstNumber);
  numbers.setB(secondNumber);
  console.log("numbers set");

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
      serviceClientOptionsPaidCall
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
