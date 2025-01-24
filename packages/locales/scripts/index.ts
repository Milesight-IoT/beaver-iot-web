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

    // locale when it takes no arguments, it tells the developer some simple commands
    if (!process.argv.slice(2).length) {
        chalk.green(program.helpInformation());
    }
}

execute();
