import chalk from 'chalk';
import { Command } from 'commander';
import { loadBinCommands } from './utils/loadBinCommands';
import config from './locale.config.json';
import pkg from '../package.json';

const program = new Command();

function execute() {
    program
        .version(pkg.version, '-v, --version', 'print the current version.')
        .name('locale')
        .usage('<command> [options]')
        .addHelpText(
            'beforeAll',
            chalk.greenBright(
                '\r\nWelcom to Locales-Manage, please read the brief help list below！\r\n',
            ),
        );

    loadBinCommands(program, config);

    program.parseAsync(process.argv);

    // locale 不带参数时, 告诉开发者一些简单 命令
    if (!process.argv.slice(2).length) {
        chalk.green(program.helpInformation());
    }
}

execute();
