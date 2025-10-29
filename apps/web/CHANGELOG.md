# @app/web

## 1.3.0

### Minor Changes

-   4b3e233: Device Module Details: New Device Canvas Tab Added.
-   4b3e233: The Dashboard module plugin now features a full-screen mode.
-   4b3e233: Newly Added Devices List Component.
-   308b5b6: Add mobile device page
-   321d648: Support scanning QR codes to quickly fill in EUI
-   4e89f86: Migrated existing plugin directories to the DrawingBoard component directory for a clearer, unified structure.
-   8e275fe: Add help center entrance and verison info in sidebar
-   6574c2a: Add device_offline_timeout field for MQTT integration
-   3f2bc2b: Making it a installable PWA
-   835477f: Introduced a dedicated DrawingBoard component for plugin rendering, enabling modularised management of plugin rendering.
-   6ed9c4f: Support advanced filters in device detail module
-   1f58e8f: Add blueprint source management module
-   308b5b6: Add some components for mobile devices
-   6db867a: Remove the tab for switching dashboard, Add a dashboard list page, and access dashboard details through the dashboard list.
-   4e89f86: Upgraded plugin Control Panel configurations from JSON to TypeScript format, supporting functions and complex logical expressions. This allows for more flexible parameter configuration and effortlessly implements dynamic associations between form fields.

### Patch Changes

-   4c00ddb: Support vconsole in mobile, and local https

## 1.2.5

### Patch Changes

-   873b230: Add CamThink-AI-Inference integration
-   873b230: Add MQTT-Device-Integrated integration

## 1.2.4

### Patch Changes

-   fix entity enum value error
-   fix typo error in global interfaces

## 1.2.3

### Minor Changes

-   Add Tag Management function and support batch processing
-   Add device grouping function
-   Entity list classification and search enhancement
-   Table component functionality enhancement

## 1.2.2

### Patch Changes

-   Fix the global bugs
-   Refactor the execution logic of dashboard
-   Use mqtt service to replace websocket
-   Use Echarts instead of Chart.js for dashboard

## 1.2.1

### Patch Changes

-   33139c3: Fix some bugs of NS integration
-   8e75412: Fix some bugs of workflow editor
-   daa20cd: Fix some bugs of role validation
-   9cdcc4d: Fix some bugs of permission management

## 1.2.0

### Minor Changes

-   e5d53f8: Add global Upload component
-   d68327c: Optimized the style of ParamAssignInput component
-   e5d53f8: Add global ToggleRadio component
-   7ca2c3f: Add parallel limit util for request
-   0069cd7: Support to choose dynamic upstream param for ConditionInput component's secondary value
-   3e51a88: Optimized the style of EntityMultipleSelect component
-   6958003: Add built-in Output node and corresponding processing logic
-   ee005b0: Optimized the style of EntityAssignSelect component
-   18a4b39: Optimized the style and add required item for ParamInput component
-   18a4b39: Optimized the style and add options for TimerInput component
-   e5d53f8: Dashboard Image plugin enhancement
-   7ca2c3f: Add queue util
-   abd9500: Add Workflow nodes: HTTPin, HTTP, Output, MQTTin

## 1.1.1

### Patch Changes

-   4fbeca1: feat: Allow switching design mode when nodes is empty
-   4fbeca1: feat: add selection mode for workflow editor
-   aa105d6: feat: Support embedded ns integration
-   b17a5bb: feat: Add icons form iconfont.cn
-   552bdf7: feat: Optimize the global style
