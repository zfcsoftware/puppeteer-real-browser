#include "sleep.h"

#if NAN_HAS_CPLUSPLUS_11

#include <thread>
#include <chrono>

void node_usleep(uint32_t usec) {
  auto end = std::chrono::steady_clock::now() + std::chrono::microseconds(usec);

  while (true) {
    auto now = std::chrono::steady_clock::now();
    if (now >= end) {
      break;
    }
    std::this_thread::sleep_for(end - now);
  }
}

#endif
