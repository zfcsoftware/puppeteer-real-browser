#include "sleep.h"

#if ( _POSIX_C_SOURCE >= 200112L ) && ( !NAN_HAS_CPLUSPLUS_11 )

#include <unistd.h>
#include <sys/time.h>

void node_usleep(uint32_t usec) {
  useconds_t done;
  struct timeval start, end;

  while (usec > 0) {
    gettimeofday(&start, NULL);
    usleep(usec);
    gettimeofday(&end, NULL);

    done = (end.tv_sec - start.tv_sec) * 1000000 + (end.tv_usec - start.tv_usec);
    if (done > usec) {
      usec = 0;
    } else {
      usec -= done;
    }
  }
}
#endif
