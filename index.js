/**
 * dotenv must be on the top of the entry file of the project
 */
require("dotenv").config();

import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";
import service from "./proto/segmentation_grpc_pb";
import messages from "./proto/segmentation_pb";
import config from "./config";
import cluster from "cluster";
import { v4 as uuidv4 } from "uuid";

const fs = require("fs");
const mime = require("mime");

const sdk = new SnetSDK(config);

const ClusterMessage = {
  WORKER_ASK_TOKEN: "WORKER_ASK_TOKEN",
  MASTER_SEND_TOKEN: "MASTER_SEND_TOKEN",
};

const writeImage = (image, debugImage = false) => {
  const imageContent = image.getContent();
  const buffer = Buffer.from(imageContent);
  const mimeType = image.getMimetype();
  const ext = mime.getExtension(mimeType) || "png";
  const path = `./segmentation_output/${Date.now()}_${uuidv4()}_${debugImage ? "debug" : ""}.${ext}`;
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
};

const uploadImage = (serviceClient) => {
  fs.readFile("./images/1.png", (err, data) => {
    if (err) throw err;
    const image = new messages.Image();
    const uint8Array = Uint8Array.from(data);
    const mimeType = mime.getType("./images/1.png");

    image.setMimetype(mimeType);
    image.setContent(uint8Array);

    const request = new messages.Request();
    request.setImg(image);

    serviceClient.service.segment(request, (serviceErr, serviceResult) => {
      if (serviceErr) throw serviceErr;
      const imageList = serviceResult.getSegmentationImgList();
      imageList.map(writeImage);
      const debugImage = serviceResult.getDebugImg()
      writeImage(debugImage, true)
    });
  });
};

const main = async () => {
  const orgId = "snet";
  const serviceId = "semantic-segmentation";
  const groupName = "default_group";
  const paymentStrategy = new DefaultPaymentStrategy(8); // provide the number of calls you like to run concurrently

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
    service.SemanticSegmentationClient,
    groupName,
    paymentStrategy,
    serviceClientOptions
  );
  // uploadImage(serviceClient);
  // return; // remove this return statement for the paid concurrent calls
  if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    const {concurrencyToken, channelId} = await serviceClient.getConcurrencyTokenAndChannelId()
    const numCPUs = require("os").cpus().length;
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
        uploadImage(serviceClient);
      }
    });
  }
};

main();
