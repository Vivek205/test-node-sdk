// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var voice_cloning_pb = require('./voice_cloning_pb.js');

function serialize_Input(arg) {
  if (!(arg instanceof voice_cloning_pb.Input)) {
    throw new Error('Expected argument of type Input');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Input(buffer_arg) {
  return voice_cloning_pb.Input.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Output(arg) {
  if (!(arg instanceof voice_cloning_pb.Output)) {
    throw new Error('Expected argument of type Output');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Output(buffer_arg) {
  return voice_cloning_pb.Output.deserializeBinary(new Uint8Array(buffer_arg));
}


var RealTimeVoiceCloningService = exports.RealTimeVoiceCloningService = {
  clone: {
    path: '/RealTimeVoiceCloning/clone',
    requestStream: false,
    responseStream: false,
    requestType: voice_cloning_pb.Input,
    responseType: voice_cloning_pb.Output,
    requestSerialize: serialize_Input,
    requestDeserialize: deserialize_Input,
    responseSerialize: serialize_Output,
    responseDeserialize: deserialize_Output,
  },
};

exports.RealTimeVoiceCloningClient = grpc.makeGenericClientConstructor(RealTimeVoiceCloningService);
