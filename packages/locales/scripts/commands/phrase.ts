import fse from 'fs-extra';
import * as path from 'path';
import inquirer from 'inquirer';
import { Command } from 'commander';
import { isFileExists } from '@milesight/scripts/src/utils';
import { pkgRoot, msgTemplate, PHRASE_WX_WORK_MENTIONED_USERS } from '../config';
import { logger, parseTemplate, awaitWrap } from '../utils/index';
import {
    phraseClient,
    getProjectLocales,
    getProjectDetail,
    uploadLocale,
    createJob,
    addLocalesToJob,
    getJobList,
    downloadLocales,
    getUploadSuccessStatus,
} from '../services/phrase';
import { sendMessage } from '../services/wx-work';

const execJobCommand = async (name?: string, options?: ConfigType['phrase']) => {
    if (!phraseClient) return;

    // ---------- Get Project & Locales Info ----------
    const [projectErrors, [project, locales] = []] = await awaitWrap(
        Promise.all([getProjectDetail(), getProjectLocales()]),
    );

    if (projectErrors) {
        logger.error(`\n💥 Failed to get project locales, please check and try again.`);
        return;
    }

    const defaultLocale = locales.find(
        locale => locale.default || locale.code === options.defaultLocale,
    );

    if (!defaultLocale) {
        logger.error(
            `\n💥 The default locale ${options.defaultLocale} does not exist in the project, please check and try again.`,
        );
        return;
    }

    logger.info(`
ℹ️ Phrase Project Info:
- Name: ${project.name}
- Locales: ${locales.map(locale => locale.name).join(', ')}
- Default Locale: ${defaultLocale.code} (Update Time: ${new Date(defaultLocale.updated_at).toLocaleString()})
    `);

    // ---------- Prompt to get answers ----------
    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'version',
            default: 'v1.0.0',
            message: 'Please enter the version of current iteration:',
        },
        {
            type: 'checkbox',
            name: 'translators',
            message: 'Please select translators:',
            validate(value) {
                if (!value.length) {
                    return 'You must choose at least one translator';
                }
                return true;
            },
            choices() {
                const translators = PHRASE_WX_WORK_MENTIONED_USERS?.split(',').map(id => id.trim());
                const options = translators.map(translator => ({
                    name: translator,
                    value: translator,
                }));

                return options || [];
            },
        },
        {
            type: 'input',
            name: 'name',
            default(ans) {
                const dateString = new Date().toLocaleDateString();
                const names = ans.translators.map(item => item.split(':')[0]).join(',');
                const defaultName = `${ans.version} - ${dateString} - ${names}`;
                return name || defaultName;
            },
            message: 'Please enter the name of the new Phrase job:',
        },
        {
            type: 'input',
            name: 'target',
            default: options.jobTarget,
            message: 'Please enter the file path of new i18n texts:',
        },
        {
            type: 'input',
            name: 'branch',
            message: 'Whether to create a new branch (if not, please leave blank):',
        },
    ]);
    const targetPath = path.join(pkgRoot, answers.target);

    // console.log({ answers, targetPath });
    if (!isFileExists(targetPath)) {
        logger.error(
            `\n💥 The file path ${targetPath} does not exist, please check and try again.`,
        );
        return;
    }

    logger.info('\n✳️ Starting to create a new Phrase job...');
    const startTime = Date.now();

    // ---------- Upload New Locale Texts ----------
    const contents = await fse.readFile(targetPath, 'utf-8');
    // const newTexts = JSON.parse(contents);
    const [uploadError, uploadTask] = await awaitWrap(
        uploadLocale({
            localeId: defaultLocale.id,
            contents,
            version: answers.version,
            fileName: `new-locales-${answers.version}.json`,
        }),
    );
    const [uploadResultError, uploadResult] = await awaitWrap(
        getUploadSuccessStatus(uploadTask.id),
    );

    if (uploadError || uploadResultError || !uploadTask?.id || uploadResult?.state !== 'success') {
        logger.error(`\n💥 Failed to upload new i18n texts, please check and try again.`);
        return;
    }
    logger.log(`=> Successfully uploaded new i18n texts to Phrase.`);

    // ---------- Create New Phrase Job ----------
    const [jobError, jobDetail] = await awaitWrap(
        createJob({
            name: answers.name,
            localeId: defaultLocale.id,
            branch: answers.branch,
            tags: [answers.version],
        }),
    );

    if (jobError || !jobDetail.id) {
        logger.error(`\n💥 Failed to create a new Phrase job, please check and try again.`);
        return;
    }
    logger.log(`=> Successfully created a new Phrase job: ${jobDetail.name}`);

    const [attachJobError] = await awaitWrap(
        addLocalesToJob({
            jobId: jobDetail.id,
            localeIds: locales
                .filter(locale => locale.id !== defaultLocale.id)
                .map(locale => locale.id),
            branch: answers.branch,
        }),
    );

    if (attachJobError) {
        logger.error(`\n💥 Failed to add locales to the Phrase job, please check and try again.`);
        return;
    }

    sendMessage({
        content: parseTemplate(msgTemplate, {
            projectName: jobDetail.project.name,
            deadline: new Date(jobDetail.due_date).toLocaleString(),
            jobName: jobDetail.name,
            jobLink: `https://app.phrase.com/accounts/${project.account.slug}/projects/${project.slug}/jobs/${jobDetail.id}`,
        }),
        mentionedMobiles: answers.translators.map(item => item.split(':')[1]),
    });

    logger.log(`⏱️ Execution time: ${((Date.now() - startTime) / 1000).toFixed(2)}s`);
    logger.success(
        `\n🎉 Successfully created a new Phrase job: [${jobDetail.name}](ID: ${jobDetail.id})`,
    );
};

const execImportCommand = async (target?: string, options?: ConfigType['phrase']) => {
    if (!phraseClient) return;

    const answers = await inquirer.prompt([
        {
            type: 'input',
            name: 'branch',
            message: 'Whether to create a new branch (if not, please leave blank):',
        },
        {
            type: 'input',
            name: 'target',
            default: target || options.importTarget,
            validate: (input: string) => !!input,
            message: 'Please enter the directory path of newest locale texts:',
        },
        {
            type: 'confirm',
            name: 'confirm',
            default: false,
            async message(ans) {
                const jobList = await getJobList({ branch: ans.branch || undefined });
                const jobs = jobList.filter(job => job.state !== 'completed');
                const msg = !jobs.length
                    ? '🟡 No Phrase jobs are in progress, do you want to continue?'
                    : `🟡 There are ${jobs.length} Phrase jobs (${jobs.map(job => job.name).join(', ')}) in progress, do you want to continue?`;

                return msg;
            },
        },
    ]);

    if (!answers.confirm) return;
    logger.info('\n✳️ Starting to import the newest i18n texts...');

    // ---------- Check and create the target directory ----------
    const targetDir = path.join(pkgRoot, answers.target);
    if (!fse.existsSync(targetDir)) {
        fse.mkdirSync(targetDir, { recursive: true });
    }

    // ---------- Downloaded newest locale texts ----------
    const locales = await getProjectLocales();
    const localesTexts = await downloadLocales({
        branch: answers.branch,
        localeIds: locales.map(locale => locale.id),
    });

    if (!localesTexts?.length) {
        logger.error(`\n💥 Failed to download the newest i18n texts, please check and try again.`);
        return;
    }

    // ---------- Write the newest texts to files ----------
    locales.forEach((locale, index) => {
        const texts = localesTexts[index];
        const fileName = `${locale.name}.json`;

        fse.outputJSONSync(path.join(targetDir, fileName), texts, {
            encoding: 'utf-8',
            flag: 'w',
            spaces: 2,
        });
    });

    // console.log(localesTexts);
    logger.success(`\n🎉 Successfully imported the newest i18n texts to: ${targetDir}`);
};

export function phraseCommand(program: Command, cmdConfig: ConfigType['phrase']) {
    // console.log({ program, commandConfig });
    program
        .command('phrase')
        .option('--job [name]', 'Create a new job and name it.')
        .option(
            '--import [path]',
            'Import the newest i18n text into the specified directory path from Phrase.',
        )
        .description('Phrase platform related operations.')
        .action(options => {
            const { job, import: imports } = options;

            if (job) {
                execJobCommand(typeof job === 'string' ? job : undefined, cmdConfig);
                return;
            }

            if (imports) {
                execImportCommand(typeof imports === 'string' ? imports : undefined, cmdConfig);
            }
        });
}
