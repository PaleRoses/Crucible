# Install script for directory: /home/valeria/Documents/Creatures/CrescentCreatures

# Set the install prefix
if(NOT DEFINED CMAKE_INSTALL_PREFIX)
  set(CMAKE_INSTALL_PREFIX "/usr/local")
endif()
string(REGEX REPLACE "/$" "" CMAKE_INSTALL_PREFIX "${CMAKE_INSTALL_PREFIX}")

# Set the install configuration name.
if(NOT DEFINED CMAKE_INSTALL_CONFIG_NAME)
  if(BUILD_TYPE)
    string(REGEX REPLACE "^[^A-Za-z0-9_]+" ""
           CMAKE_INSTALL_CONFIG_NAME "${BUILD_TYPE}")
  else()
    set(CMAKE_INSTALL_CONFIG_NAME "")
  endif()
  message(STATUS "Install configuration: \"${CMAKE_INSTALL_CONFIG_NAME}\"")
endif()

# Set the component getting installed.
if(NOT CMAKE_INSTALL_COMPONENT)
  if(COMPONENT)
    message(STATUS "Install component: \"${COMPONENT}\"")
    set(CMAKE_INSTALL_COMPONENT "${COMPONENT}")
  else()
    set(CMAKE_INSTALL_COMPONENT)
  endif()
endif()

# Install shared libraries without execute permission?
if(NOT DEFINED CMAKE_INSTALL_SO_NO_EXE)
  set(CMAKE_INSTALL_SO_NO_EXE "0")
endif()

# Is this installation the result of a crosscompile?
if(NOT DEFINED CMAKE_CROSSCOMPILING)
  set(CMAKE_CROSSCOMPILING "FALSE")
endif()

# Set path to fallback-tool for dependency-resolution.
if(NOT DEFINED CMAKE_OBJDUMP)
  set(CMAKE_OBJDUMP "/usr/bin/objdump")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  # Include the install script for the subdirectory.
  include("/home/valeria/Documents/Creatures/CrescentCreatures/build/_deps/json-build/cmake_install.cmake")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib64" TYPE STATIC_LIBRARY FILES "/home/valeria/Documents/Creatures/CrescentCreatures/build/libcrescent_creatures.a")
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/include/crescent" TYPE FILE FILES
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/DynamicCreature.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/CreatureEnums.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/CreatureStructures.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/CreatureTheme.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/CreatureEnvironment.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/CreatureEvolution.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/CreatureExceptions.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/private/DataLoader.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/private/Serializer.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/private/ImplementationSpecific.h"
    "/home/valeria/Documents/Creatures/CrescentCreatures/include/crescent/private/InternalDetails.h"
    )
endif()

if(CMAKE_INSTALL_COMPONENT STREQUAL "Unspecified" OR NOT CMAKE_INSTALL_COMPONENT)
  if(EXISTS "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib64/cmake/crescent_creatures/crescent_creatures-targets.cmake")
    file(DIFFERENT _cmake_export_file_changed FILES
         "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib64/cmake/crescent_creatures/crescent_creatures-targets.cmake"
         "/home/valeria/Documents/Creatures/CrescentCreatures/build/CMakeFiles/Export/169d3c50ad566fa4d059ebde03500524/crescent_creatures-targets.cmake")
    if(_cmake_export_file_changed)
      file(GLOB _cmake_old_config_files "$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib64/cmake/crescent_creatures/crescent_creatures-targets-*.cmake")
      if(_cmake_old_config_files)
        string(REPLACE ";" ", " _cmake_old_config_files_text "${_cmake_old_config_files}")
        message(STATUS "Old export file \"$ENV{DESTDIR}${CMAKE_INSTALL_PREFIX}/lib64/cmake/crescent_creatures/crescent_creatures-targets.cmake\" will be replaced.  Removing files [${_cmake_old_config_files_text}].")
        unset(_cmake_old_config_files_text)
        file(REMOVE ${_cmake_old_config_files})
      endif()
      unset(_cmake_old_config_files)
    endif()
    unset(_cmake_export_file_changed)
  endif()
  file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib64/cmake/crescent_creatures" TYPE FILE FILES "/home/valeria/Documents/Creatures/CrescentCreatures/build/CMakeFiles/Export/169d3c50ad566fa4d059ebde03500524/crescent_creatures-targets.cmake")
  if(CMAKE_INSTALL_CONFIG_NAME MATCHES "^()$")
    file(INSTALL DESTINATION "${CMAKE_INSTALL_PREFIX}/lib64/cmake/crescent_creatures" TYPE FILE FILES "/home/valeria/Documents/Creatures/CrescentCreatures/build/CMakeFiles/Export/169d3c50ad566fa4d059ebde03500524/crescent_creatures-targets-noconfig.cmake")
  endif()
endif()

if(CMAKE_INSTALL_COMPONENT)
  if(CMAKE_INSTALL_COMPONENT MATCHES "^[a-zA-Z0-9_.+-]+$")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INSTALL_COMPONENT}.txt")
  else()
    string(MD5 CMAKE_INST_COMP_HASH "${CMAKE_INSTALL_COMPONENT}")
    set(CMAKE_INSTALL_MANIFEST "install_manifest_${CMAKE_INST_COMP_HASH}.txt")
    unset(CMAKE_INST_COMP_HASH)
  endif()
else()
  set(CMAKE_INSTALL_MANIFEST "install_manifest.txt")
endif()

if(NOT CMAKE_INSTALL_LOCAL_ONLY)
  string(REPLACE ";" "\n" CMAKE_INSTALL_MANIFEST_CONTENT
       "${CMAKE_INSTALL_MANIFEST_FILES}")
  file(WRITE "/home/valeria/Documents/Creatures/CrescentCreatures/build/${CMAKE_INSTALL_MANIFEST}"
     "${CMAKE_INSTALL_MANIFEST_CONTENT}")
endif()
