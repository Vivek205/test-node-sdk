/**
 * dotenv must be on the top of the entry file of the project
 */
require("dotenv").config();

import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";
import service from "./proto/voice_cloning_grpc_pb";
import messages from "./proto/voice_cloning_pb";
import config from "./config";
import cluster from "cluster";
import { v4 as uuidv4 } from "uuid";

const fs = require("fs");

const sdk = new SnetSDK(config);
const numCPUs = require("os").cpus().length;

const ClusterMessage = {
  WORKER_ASK_TOKEN: "WORKER_ASK_TOKEN",
  MASTER_SEND_TOKEN: "MASTER_SEND_TOKEN",
};

// const writeImage = (image, debugImage = false) => {
//   const imageContent = image.getContent();
//   const buffer = Buffer.from(imageContent);
//   const mimeType = image.getMimetype();
//   const ext = mime.getExtension(mimeType) || "png";
//   const path = `./segmentation_output/${Date.now()}_${uuidv4()}_${debugImage ? "debug" : ""}.${ext}`;
//   fs.open(path, "w", (err, fd) => {
//     if (err) throw err;
//     fs.write(fd, buffer, 0, buffer.length, (err, writtenbytes) => {
//       if (err) {
//         console.log("Cant write to file");
//       } else {
//         console.log(writtenbytes + " characters added to file");
//       }
//     });
//   });
// };

const saveAudioFile = audio => {
  const ext = "mp3"
  const path = `./output/${Date.now()}_${uuidv4()}.${ext}`;
  const buffer = Buffer.from(audio);
  fs.open(path, "w", (err, fd) => {
    if (err) throw err;
    fs.write(fd, buffer, 0, buffer.length, (err, writtenbytes) => {
      if (err) {
        console.log("Cant write to file");
      } else {
        console.log(writtenbytes + " characters added to file");
      }
    });
  });
}

const executeService = (serviceClient) => {
  fs.readFile("./media/sample_input.mp3", (err, data) => {
    if (err) throw err;

    const audio = Uint8Array.from(data);
    const sentence = "Given that most of the innovation in the AI algorithm and product worlds come from students, startups or independent developers."

    const input = new messages.Input()
    // input.setAudioUrl() // Optional input
    input.setAudio(audio)
    input.setSentence(sentence)

    serviceClient.service.clone(input, (serviceErr, serviceResult) => {
      console.log("service error", serviceErr)
      if (serviceErr) throw serviceErr;
      const audio = serviceResult.getAudio()
      saveAudioFile(audio)
    });
  });
};

const main = async () => {
  const orgId = "snet";
  const serviceId = "real-time-voice-cloning";
  const groupName = "default_group";
  // provide the number of calls you like to run concurrently
  // We are signing concurrent calls equal to the number of threads available
  const paymentStrategy = new DefaultPaymentStrategy(numCPUs); 

  const serviceClientOptions = {
    email: process.env.EMAIL,
    tokenToMakeFreeCall: process.env.FREE_CALL_TOKEN ? process.env.FREE_CALL_TOKEN.toUpperCase() : "",
    tokenExpirationBlock: Number(process.env.TOKEN_EXPIRATION_BLOCK),
    disableBlockchainOperations: false,
    concurrency: true,
  };

  const serviceClient = await sdk.createServiceClient(
    orgId,
    serviceId,
    service.RealTimeVoiceCloningClient,
    groupName,
    paymentStrategy,
    serviceClientOptions
  );
  // executeService(serviceClient); // comment this out during concurrent calls
  // return; // remove this return statement for the paid concurrent calls
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    const {concurrencyToken, channelId} = await serviceClient.getConcurrencyTokenAndChannelId()
    
    console.log("num of available CPU", numCPUs)
    for (let i = 0; i < numCPUs; i++) {
      const fork = cluster.fork();
      fork.on("message", (message) => {
        if (message === ClusterMessage.WORKER_ASK_TOKEN) {
          fork.send({ concurrencyToken, channelId, info: ClusterMessage.MASTER_SEND_TOKEN });
        }
      });
    }

    cluster.on("exit", (worker, code, signal) => {
      console.log(`worker ${worker.process.pid} died with code ${code}`);
    });
  } else {
    process.send(ClusterMessage.WORKER_ASK_TOKEN);
    process.on("message", async (message) => {
      const { concurrencyToken, info, channelId } = message;
      if (info === ClusterMessage.MASTER_SEND_TOKEN) {
        serviceClient.setConcurrencyTokenAndChannelId(concurrencyToken,channelId)
        executeService(serviceClient);
      }
    });
  }
};

main();
