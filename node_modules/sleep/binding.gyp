{
  'targets': [
    {
      'target_name': 'node_sleep',
      'sources': [
        'module_init.cc',
        'sleep.h',
        'sleep_cpp11.cc', # All implementation files should be enabled in all OS/archtectures,
        'sleep_posix.cc', # appropriate implementation is selected by preprocessor macros,
        'sleep_win.cc',
      ],
      "include_dirs": ["<!(node -e \"require('nan')\")"]
    }
  ]
}
