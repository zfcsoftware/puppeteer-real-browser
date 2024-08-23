#include "sleep.h"

#if ( defined _WIN32 || defined _WIN64 ) && ( !NAN_HAS_CPLUSPLUS_11 )

#include <windows.h>

void node_usleep(uint32_t usec) {
  LARGE_INTEGER li;
  li.QuadPart = -10LL * usec; // negative values for relative time

  HANDLE timer = CreateWaitableTimer(NULL, TRUE, NULL);
  if(!timer) return;

  SetWaitableTimer(timer, &li, 0, NULL, NULL, 0);
  WaitForSingleObject(timer, INFINITE);
  CloseHandle(timer);
}
#endif

