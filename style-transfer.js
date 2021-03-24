/**
 * dotenv must be on the top of the entry file of the project
 */
require("dotenv").config();
import dotenv from 'dotenv'
import SnetSDK, { DefaultPaymentStrategy } from "snet-sdk";
import service from "./client_libraries/snet/style-transfer/nodejs/style_transfer_grpc_pb.js";
import messages from "./client_libraries/snet/style-transfer/nodejs/style_transfer_pb.js";
import config from "./config";

dotenv.config()

const sdk = new SnetSDK(config);

/**
 * 
 * @param {string} content 
 * @param {string} style 
 * @param {number} contentSize 
 * @param {number} styleSize 
 * @param {boolean} preserveColor 
 * @param {number} alpha 
 * @param {boolean} crop 
 * @param {string} saveExt 
 */
const styleTransfer = async (content,style, contentSize, styleSize, preserveColor, alpha, crop, saveExt) => {
  const orgId = "snet";
  const serviceId = "style-transfer";
  const groupName = "default_group";
  const paymentStrategy = new DefaultPaymentStrategy(2);
  const serviceClientOptions = {
    tokenToMakeFreeCall: "0xef2959c63d38aacc805fbdd44b3844581f16eb2b285a16a78aa6fd97a8e5e12042f6f384b9ceaa4b872e10f9d0b9599ceefba45ac89a0640090b92212262e5041b".toUpperCase(),
    tokenExpirationBlock: 12273159,
    email: "ichbinvivek@gmail.com",
    disableBlockchainOperations: false,
    concurrency: true,
  };

  const closeConnection = () => {
    sdk.web3.currentProvider.connection && sdk.web3.currentProvider.connection.close();
  };

  try {
    const serviceClient = await sdk.createServiceClient(
      orgId,
      serviceId,
      service.StyleTransferClient,
      groupName,
      paymentStrategy,
      serviceClientOptions
    );
      console.log("created service client");
    await new Promise((resolve,reject)=>{
      const request = new messages.TransferImageStyleRequest()
      request.setContent()
      request.setStyle()
      request.setContentsize()
      request.setStylesize()
      request.setPreservecolor()
      request.setAlpha()
      request.setCrop()
      request.setSaveext()

      serviceClient.service.transfer_image_style(request, (err, result)=> {
        if(err){
          return reject(err)
        }
        resolve(result)
      })
    })

    closeConnection();
  } catch (error) {
    console.log("promise error", error);
    closeConnection();
  }
};

export default styleTransfer;
