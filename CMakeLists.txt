cmake_minimum_required(VERSION 3.14)
project(crescent_creatures
 VERSION 1.0.0
 DESCRIPTION "Dynamic creature generation system"
 LANGUAGES CXX
)

# Determine if this is a master project or subproject
if(NOT DEFINED CRESCENT_MASTER_PROJECT)
    set(CRESCENT_MASTER_PROJECT OFF)
    if(CMAKE_CURRENT_SOURCE_DIR STREQUAL CMAKE_SOURCE_DIR)
        set(CRESCENT_MASTER_PROJECT ON)
    endif()
endif()

# Only export targets if this is the master project
if(CRESCENT_MASTER_PROJECT)
    set(JSON_Install ON CACHE INTERNAL "")
else()
    set(JSON_Install OFF CACHE INTERNAL "")
endif()

# Set C++ standard
set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Options
option(CRESCENT_BUILD_TESTS "Build test suite" OFF)
option(CRESCENT_BUILD_EXAMPLES "Build example programs" OFF)
option(CRESCENT_ENABLE_SANITIZERS "Enable sanitizers in debug builds" OFF)

# Dependencies
include(FetchContent)

# Configure json options before declaring it
set(JSON_BuildTests OFF CACHE INTERNAL "")

# nlohmann_json
FetchContent_Declare(
    json
    URL https://github.com/nlohmann/json/releases/download/v3.11.2/json.tar.xz
    URL_HASH SHA256=8c4b26bf4b422252e13f332bc5e388ec0ab5c3443d24399acb675e68278d341f
)
FetchContent_MakeAvailable(json)

# Library source files
set(CRESCENT_SOURCES
 src/DynamicCreature.cpp
 src/CreatureStructures.cpp
 src/CreatureTheme.cpp
 src/CreatureEnvironment.cpp
 src/CreatureEvolution.cpp
)

# Library headers
set(CRESCENT_HEADERS
 include/crescent/DynamicCreature.h
 include/crescent/CreatureEnums.h
 include/crescent/CreatureStructures.h
 include/crescent/CreatureTheme.h
 include/crescent/CreatureEnvironment.h
 include/crescent/CreatureEvolution.h
 include/crescent/CreatureExceptions.h
 include/crescent/private/DataLoader.h
 include/crescent/private/Serializer.h
 include/crescent/private/ImplementationSpecific.h
 include/crescent/private/InternalDetails.h
)

# Create library
add_library(crescent_creatures ${CRESCENT_SOURCES} ${CRESCENT_HEADERS})
add_library(crescent::creatures ALIAS crescent_creatures)

# Set include directories
target_include_directories(crescent_creatures
 PUBLIC
  $<BUILD_INTERFACE:${CMAKE_CURRENT_SOURCE_DIR}/include>
  $<INSTALL_INTERFACE:include>
 PRIVATE
  ${CMAKE_CURRENT_SOURCE_DIR}/src
)

# Link dependencies
target_link_libraries(crescent_creatures PUBLIC nlohmann_json::nlohmann_json)

# Compiler warnings
include(cmake/CompilerWarnings.cmake)
set_project_warnings(crescent_creatures)

# Sanitizers for debug builds
if(CRESCENT_ENABLE_SANITIZERS)
 include(cmake/Sanitizers.cmake)
 enable_sanitizers(crescent_creatures)
endif()

# Installation
include(GNUInstallDirs)

install(TARGETS crescent_creatures
    EXPORT crescent_creatures-targets
    LIBRARY DESTINATION ${CMAKE_INSTALL_LIBDIR}
    ARCHIVE DESTINATION ${CMAKE_INSTALL_LIBDIR}
    RUNTIME DESTINATION ${CMAKE_INSTALL_BINDIR}
)

install(
    FILES ${CRESCENT_HEADERS}
    DESTINATION ${CMAKE_INSTALL_INCLUDEDIR}/crescent
)

# Create and install the export set
include(CMakePackageConfigHelpers)
write_basic_package_version_file(
    "${CMAKE_CURRENT_BINARY_DIR}/crescent_creatures-config-version.cmake"
    VERSION ${PROJECT_VERSION}
    COMPATIBILITY AnyNewerVersion
)

install(
    EXPORT crescent_creatures-targets
    NAMESPACE crescent::
    DESTINATION ${CMAKE_INSTALL_LIBDIR}/cmake/crescent_creatures
)
# Tests
if(CRESCENT_BUILD_TESTS)
 enable_testing()
 add_subdirectory(tests)
endif()

# Examples
if(CRESCENT_BUILD_EXAMPLES)
 add_subdirectory(examples)
endif()