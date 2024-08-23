#include "sleep.h"

using v8::FunctionTemplate;
using v8::String;

NAN_METHOD(MUSleep) {
  Nan::HandleScope scope;

  if (info.Length() < 1 || !info[0]->IsUint32()) {
    Nan::ThrowError("Expected number of microseconds");
    return;
  }

  node_usleep(Nan::To<uint32_t>(info[0]).FromJust());

  info.GetReturnValue().SetUndefined();
}

NAN_MODULE_INIT(init) {
  Nan::Set(target, Nan::New<String>("usleep").ToLocalChecked(),
    Nan::GetFunction(Nan::New<FunctionTemplate>(MUSleep)).ToLocalChecked());
}

NODE_MODULE(node_sleep, init)
