// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var style_transfer_pb = require('./style_transfer_pb.js');

function serialize_Image(arg) {
  if (!(arg instanceof style_transfer_pb.Image)) {
    throw new Error('Expected argument of type Image');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Image(buffer_arg) {
  return style_transfer_pb.Image.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_TransferImageStyleRequest(arg) {
  if (!(arg instanceof style_transfer_pb.TransferImageStyleRequest)) {
    throw new Error('Expected argument of type TransferImageStyleRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_TransferImageStyleRequest(buffer_arg) {
  return style_transfer_pb.TransferImageStyleRequest.deserializeBinary(new Uint8Array(buffer_arg));
}


var StyleTransferService = exports.StyleTransferService = {
  transfer_image_style: {
    path: '/StyleTransfer/transfer_image_style',
    requestStream: false,
    responseStream: false,
    requestType: style_transfer_pb.TransferImageStyleRequest,
    responseType: style_transfer_pb.Image,
    requestSerialize: serialize_TransferImageStyleRequest,
    requestDeserialize: deserialize_TransferImageStyleRequest,
    responseSerialize: serialize_Image,
    responseDeserialize: deserialize_Image,
  },
};

exports.StyleTransferClient = grpc.makeGenericClientConstructor(StyleTransferService);
