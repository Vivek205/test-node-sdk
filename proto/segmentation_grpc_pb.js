// GENERATED CODE -- DO NOT EDIT!
/* eslint-disable */
'use strict';
var grpc = require('grpc');
var segmentation_pb = require('./segmentation_pb.js');

function serialize_MetaRequest(arg) {
  if (!(arg instanceof segmentation_pb.MetaRequest)) {
    throw new Error('Expected argument of type MetaRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_MetaRequest(buffer_arg) {
  return segmentation_pb.MetaRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_MetaResult(arg) {
  if (!(arg instanceof segmentation_pb.MetaResult)) {
    throw new Error('Expected argument of type MetaResult');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_MetaResult(buffer_arg) {
  return segmentation_pb.MetaResult.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Request(arg) {
  if (!(arg instanceof segmentation_pb.Request)) {
    throw new Error('Expected argument of type Request');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Request(buffer_arg) {
  return segmentation_pb.Request.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Result(arg) {
  if (!(arg instanceof segmentation_pb.Result)) {
    throw new Error('Expected argument of type Result');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Result(buffer_arg) {
  return segmentation_pb.Result.deserializeBinary(new Uint8Array(buffer_arg));
}


var SemanticSegmentationService = exports.SemanticSegmentationService = {
  segment: {
    path: '/SemanticSegmentation/segment',
    requestStream: false,
    responseStream: false,
    requestType: segmentation_pb.Request,
    responseType: segmentation_pb.Result,
    requestSerialize: serialize_Request,
    requestDeserialize: deserialize_Request,
    responseSerialize: serialize_Result,
    responseDeserialize: deserialize_Result,
  },
  meta: {
    path: '/SemanticSegmentation/meta',
    requestStream: false,
    responseStream: false,
    requestType: segmentation_pb.MetaRequest,
    responseType: segmentation_pb.MetaResult,
    requestSerialize: serialize_MetaRequest,
    requestDeserialize: deserialize_MetaRequest,
    responseSerialize: serialize_MetaResult,
    responseDeserialize: deserialize_MetaResult,
  },
};

exports.SemanticSegmentationClient = grpc.makeGenericClientConstructor(SemanticSegmentationService);
