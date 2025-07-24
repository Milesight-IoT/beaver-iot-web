# Beaver IoT Web

Beaver IoT Web is a Monorepo-based frontend project that encompasses the web application and its dependent build scripts, project specifications, internationalization, and common code libraries. It is managed using Pnpm Workspace, providing a unified development environment and build process for ease of development and maintenance.

## Directory Structure

```
beaver-iot-web
├── apps            # Application directory
│   └── web         # Web application
│
├── packages        # Dependency libraries directory
│   ├── locales     # Internationalization library
│   ├── scripts     # Common scripts library
│   ├── shared      # Common code library
│   └── spec        # Project specifications library
│
├── README.md
├── package.json
├── pnpm-lock.yaml
└── pnpm-workspace.yaml
```

## Development and Maintenance

### Basic Environment Configuration

It is recommended to use Pnpm for managing the environment and dependencies of this project. Below is a simple example:

> To ensure consistency in the development and debugging environment, we require the basic environment versions to be `pnpm>=8.0.0` and `node>=20.0.0`. Versions below these will not be supported. If Pnpm & Node are already installed, you can skip this step.

1. Install Pnpm

    ```bash
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    ```

    Refer to the [Pnpm installation documentation](https://pnpm.io/installation).

2. Install Node

    ```bash
    # Install the LTS version of Node.js
    pnpm env use --global lts
    ```

    Refer to the [Pnpm Node.js environment management documentation](https://pnpm.io/cli/env).

3. Clone the repository locally

    Generate an SSH Key (if not already available locally):

    ```bash
    # Press "Enter" through the prompts
    ssh-keygen -t rsa -C "your_email@domain.com"

    # Copy the public key
    # Git Bash on Windows
    cat ~/.ssh/id_rsa.pub | clip

    # Mac
    cat ~/.ssh/id_rsa.pub | pbcopy
    ```

    Copy the generated SSH public key and paste it into the `User Settings -> SSH Keys` on GitLab. Then, clone the project locally without a password:

    ```bash
    # Clone the repository
    git clone git@github.com:Milesight-IoT/beaver-iot-web.git

    # Enter the project directory
    cd beaver-iot-web

    # Configure the commit username and email
    # To modify globally, add the --global parameter
    git config user.name xxx
    git config user.email xxx@domain.com
    ```

### Start Local Development Service

```bash
# Install dependencies
pnpm i

# Start the local development service
# Dependencies in the packages named `@milesight` will also start the development service
pnpm run start
```

### Internationalization Development

The project integrates internationalization support, which developers can enable as needed.

All text content is maintained in the `packages/locales` library. When adding new text, it is recommended to add it to the corresponding module in `packages/locales/src/lang/en`. After development, use the `pnpm run i18n:export` command to export all newly added text as JSON for translation.

Translated text can be placed in the `packages/locales/import` directory, then execute the `pnpm run i18n:import` command to import the text into `packages/locales/src/lang`, making it available for use in the application.

### Build Compilation

Simply execute the command:

```bash
pnpm run build
```

This command will build all sub-applications and dependency libraries in the Monorepo, with the build output located in the `dist` directory of each sub-library.

### Common Commands

| Command | Description |
| ---- | ---- |
| `pnpm run start` | Start the development service |
| `pnpm run build` | Start the build compilation |
| `pnpm run i18n:import` | Import internationalization text |
| `pnpm run i18n:export` | Export internationalization text, with validation of new text |

## Relevant Links

- [Pnpm](https://pnpm.io/)
- [Node](https://nodejs.org/)
