/**
 * dotenv must be on the top of the entry file of the project
 */
require("dotenv").config();

import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";
import service from "./proto/example_service_grpc_pb";
import messages from "./proto/example_service_pb";
import config from "./config";
import cluster from "cluster";
import { fork } from "child_process";

const sdk = new SnetSDK(config);
var numbers = new messages.Numbers();

const main = async (firstNumber, secondNumber) => {
  const orgId = "6ce80f485dae487688c3a083688819bb";
  const serviceId = "test_freecall";
  const groupName = "default_group";
  const paymentStrategy = new DefaultPaymentStrategy(4);
//   const serviceClientOptionsPaidCall = {
//     // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall
//     tokenToMakeFreeCall: "",
//     // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall,
//     tokenExpirationBlock: 9342373,
//     email: "freecallsdk@grr.la",
//     disableBlockchainOperations: false,
//     concurrency: true,
//   };

  const serviceClientOptionsPaidCall = {
    email: "ichbinvivek@gmail.com",
    // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall
    tokenToMakeFreeCall: "",
    // generated from marketplace : https://ropsten-dapp.singularitynet.io/servicedetails/org/6ce80f485dae487688c3a083688819bb/service/test_freecall,
    tokenExpirationBlock: 9618084,
    disableBlockchainOperations: false,
    concurrency: true,
  };

  numbers.setA(firstNumber);
  numbers.setB(secondNumber);
  //   console.log("numbers set");

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
      //   console.log("Result:", result.getValue());
      //   console.log("<---------->");
      resolve(result);
    }
  };

  try {
    console.log("init service client");
    const serviceClient = await sdk.createServiceClient(
        orgId,
        serviceId,
        service.CalculatorClient,
        groupName,
        paymentStrategy,
        serviceClientOptionsPaidCall
      );

      const add = () =>
        new Promise((resolve, reject) => {
          console.log(`master Performing ${firstNumber} + ${secondNumber}`);
          serviceClient.service.add(numbers, responseHandler(resolve, reject));
        });
      add.displayName = "add";

      const sub = () =>
        new Promise((resolve, reject) => {
          console.log(`worker:${cluster.worker.id}  Performing ${firstNumber} - ${secondNumber}`);
          serviceClient.service.sub(numbers, responseHandler(resolve, reject));
        });
      sub.displayName = "sub";

      const mul = () =>
        new Promise((resolve, reject) => {
          console.log(`worker:${cluster.worker.id}  Performing ${firstNumber} * ${secondNumber}`);
          serviceClient.service.mul(numbers, responseHandler(resolve, reject));
        });
      mul.displayName = "mul";

      const div = () =>
        new Promise((resolve, reject) => {
          console.log(`worker:${cluster.worker.id}  Performing ${firstNumber} / ${secondNumber}`);
          serviceClient.service.div(numbers, responseHandler(resolve, reject));
        });
      div.displayName = "div";

      const serviceMethods = [add, sub, mul, div];

    if (cluster.isMaster) {
      
      const {concurrencyToken, channelId} = await serviceClient.getConcurrencyTokenAndChannelId()
      console.log({concurrencyToken})
      console.log("service client created success!");
      console.log(`worker id `);

      

      const numCPUs = require("os").cpus().length;
      console.log("cpu count", numCPUs);
    //   const method = workerMethod[0];
    //   const result = await method();
    serviceMethods.forEach(method=>{
        const worker = cluster.fork()
        worker.on("message", message=>{
            console.log(`worker:${worker.id}, message:${message}`)
            worker.send({concurrencyToken, info:"master: sent you the concurrency token",channelId})
        })
    })
    //   for (let i = 0; i < 3; i++) {
    //     const fork = cluster.fork();
    //     fork.on("message", (message) => {
    //       console.log(`worker's message ${message}`);
    //       const forkMethod = workerMethod[i + 1];
    //       console.log("workerMethod", workerMethod);
    //       console.log("forkMethod", forkMethod);
    //       fork.send({ method: forkMethod });
    //     });
    //   }
    } else {
      process.send(`send me the token for concurrency`);
      process.on("message", async (message) => {
        const { concurrencyToken, info,channelId } = message;
        console.log(info);
        serviceClient.setConcurrencyTokenAndChannelId(concurrencyToken,channelId)
        const method = serviceMethods[cluster.worker.id-1]
        console.log(`method: ${method.displayName} alloted for worker ${cluster.worker.id}`)
        const result = await method();
        console.log(
          `result for the worker:${cluster.worker.id},method:${
            method.displayName
          } is ${result}`
        );
      });
      //   console.log(`Worker ${process.pid} ${cluster.worker.id}`);
      //   const method = workerMethod[cluster.worker.id];
      //   console.log(`worker:${cluster.worker.id},method:${method.displayName}`);
      //   const result = await method();
    }

    // closeConnection();
  } catch (error) {
    console.log("promise error", error);
    closeConnection();
  }
};

main(6, 7);
