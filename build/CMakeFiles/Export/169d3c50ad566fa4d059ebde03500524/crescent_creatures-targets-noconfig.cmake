#----------------------------------------------------------------
# Generated CMake target import file.
#----------------------------------------------------------------

# Commands may need to know the format version.
set(CMAKE_IMPORT_FILE_VERSION 1)

# Import target "crescent::crescent_creatures" for configuration ""
set_property(TARGET crescent::crescent_creatures APPEND PROPERTY IMPORTED_CONFIGURATIONS NOCONFIG)
set_target_properties(crescent::crescent_creatures PROPERTIES
  IMPORTED_LINK_INTERFACE_LANGUAGES_NOCONFIG "CXX"
  IMPORTED_LOCATION_NOCONFIG "${_IMPORT_PREFIX}/lib64/libcrescent_creatures.a"
  )

list(APPEND _cmake_import_check_targets crescent::crescent_creatures )
list(APPEND _cmake_import_check_files_for_crescent::crescent_creatures "${_IMPORT_PREFIX}/lib64/libcrescent_creatures.a" )

# Commands beyond this point should not need to know the version.
set(CMAKE_IMPORT_FILE_VERSION)
