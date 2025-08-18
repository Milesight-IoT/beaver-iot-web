import axios from 'axios';
import {
    PHRASE_PROJECT_ID,
    PHRASE_ACCESS_TOKEN,
    PHRASE_JOB_REVIEWERS,
    PHRASE_JOB_TRANSLATORS,
} from '../config';
import { logger, getResponseData, delay } from '../utils/index';
import config from '../locale.config.json';

export const phraseClient = (() => {
    if (!PHRASE_PROJECT_ID || !PHRASE_ACCESS_TOKEN) {
        logger.error('Please set PHRASE_PROJECT_ID and PHRASE_ACCESS_TOKEN in .env.local');
        return;
    }

    const instance = axios.create({
        baseURL: config.phrase?.baseUrl,
        headers: {
            Authorization: `Bearer ${PHRASE_ACCESS_TOKEN}`,
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.response.use(
        resp => {
            return resp;
        },
        err => {
            return Promise.reject(err);
        },
    );

    return instance;
})();

const MAX_PER_PAGE = 100;

// ---------- User ----------
/**
 * Get user info
 */
export const getUserInfo = async () => {
    const resp = await phraseClient?.get('/user');
    return getResponseData(resp);
};

/**
 * List all accounts the current user has access to.
 */
export const getAccounts = async (): Promise<
    {
        id: string;
        name: string;
        company: string;
        created_at: Date;
        updated_at: Date;
    }[]
> => {
    const resp = await phraseClient?.get('/accounts');
    return getResponseData(resp);
};

/**
 * Get all users active in the account.
 */
export const getAccountMembers = async (
    accountId: string,
): Promise<
    {
        id: string;
        email: string;
        username: string;
        role: string;
        created_at: Date;
        [key: string]: any;
    }[]
> => {
    const resp = await phraseClient?.get(`/accounts/${accountId}/members`);
    return getResponseData(resp);
};

// ---------- Project ----------
/**
 * Get project detail
 */
export const getProjectDetail = async (): Promise<{
    id: string;
    name: string;
    slug: string;
    main_format: string;
    account: {
        id: string;
        name: string;
        slug: string;
        company: string;
        created_at: Date;
        updated_at: Date;
    };
    created_at: string;
    updated_at: string;
    [key: string]: any;
}> => {
    const resp = await phraseClient?.get(`/projects/${PHRASE_PROJECT_ID}`);
    return getResponseData(resp);
};

// ---------- Branch ----------
/**
 * Get all branches of current project
 */
export const getBranches = async () => {
    const resp = await phraseClient?.get(`/projects/${PHRASE_PROJECT_ID}/branches`);
    return getResponseData(resp);
};

/**
 * Get branch detail
 * @param branchName The name of the branch
 */
export const getBranchDetail = async (branchName: string) => {
    const resp = await phraseClient?.get(`/projects/${PHRASE_PROJECT_ID}/branches/${branchName}`);
    return getResponseData(resp);
};

/**
 * Create a new branch
 * @param branchName The name of the branch
 */
export const createBranch = async (branchName: string) => {
    const resp = await phraseClient?.post(`/projects/${PHRASE_PROJECT_ID}/branches`, {
        name: branchName,
    });
    return getResponseData(resp);
};

// ---------- Job ----------
/**
 * Get job detail
 */
export const getJobDetail = async (jobId: string, branch?: string) => {
    const resp = await phraseClient?.get(`/projects/${PHRASE_PROJECT_ID}/jobs/${jobId}`, {
        params: {
            branch,
        },
    });
    return getResponseData(resp);
};

/**
 * List all jobs for the given project
 */
export const getJobList = async (options?: {
    branch: string;
    state?: PhraseJobState;
}): Promise<
    {
        id: string;
        name: string;
        state: PhraseJobState;
        due_date: Date;
        created_at: Date;
        updated_at: Date;
        [key: string]: any;
    }[]
> => {
    const resp = await phraseClient?.get(`/projects/${PHRASE_PROJECT_ID}/jobs`, {
        params: {
            page: 1,
            per_page: 100,
            state: options?.state,
        },
    });
    return getResponseData(resp);
};

/**
 * Create a new job
 */
export const createJob = async (options: {
    name: string;
    localeId: string;
    tags?: string[];
    keyIds?: string[];
    branch?: string;
    dueDate?: Date;
}): Promise<{
    id: string;
    name: string;
    owner: {
        id: string;
        name: string;
        username: string;
    };
    project: {
        id: string;
        name: string;
        created_at: Date;
        updated_at: Date;
    };
    state: string;
    due_date: Date;
    keys: {
        id: string;
        name: string;
    }[];
    created_at: Date;
    updated_at: Date;
    [key: string]: any;
}> => {
    const {
        name,
        localeId,
        tags,
        // keyIds,
        dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    } = options;
    const resp = await phraseClient?.post(`/projects/${PHRASE_PROJECT_ID}/jobs`, {
        name,
        source_locale_id: localeId,
        tags,
        due_date: dueDate,
        // translation_key_ids: keyIds,
    });

    return getResponseData(resp);
};

/**
 * Delete job
 */
export const deleteJob = async (jobId: string) => {
    const resp = await phraseClient?.delete(`/projects/${PHRASE_PROJECT_ID}/jobs/${jobId}`);
    return getResponseData(resp);
};

/**
 * Adds a target locale to a job
 */
export const addLocalesToJob = async (options: {
    jobId: string;
    localeIds: string[];
    branch?: string;
    owner?: {
        id: string;
        name: string;
        username: string;
    };
}): Promise<
    {
        id: string;
        job: {
            id: string;
            name: string;
            state: string;
        };
        locale: {
            id: string;
            name: string;
            code: string;
        };
        users: {
            id: string;
            name: string;
            username: string;
            role: string;
        }[];
        complete: boolean;
        translation_completed_at: Date;
        review_completed_at: Date;
    }[]
> => {
    const account = await getAccounts();
    const members = await getAccountMembers(account[0].id);
    const userIds = members
        ?.filter(mem => {
            const translators = PHRASE_JOB_TRANSLATORS?.split(',').map(id => id.trim());
            return translators?.includes(mem.email) || translators?.includes(mem.username);
        })
        .map(mem => mem.id);
    const reviewerIds = members
        ?.filter(mem => {
            const reviewers = PHRASE_JOB_REVIEWERS?.split(',').map(id => id.trim());
            return reviewers?.includes(mem.email) || reviewers?.includes(mem.username);
        })
        .map(mem => mem.id);
    const promises = [];

    if (!userIds?.length && options.owner) {
        userIds.push(options.owner.id);
    }

    for (const localeId of options.localeIds) {
        promises.push(
            phraseClient?.post(`/projects/${PHRASE_PROJECT_ID}/jobs/${options.jobId}/locales`, {
                locale_id: localeId,
                user_ids: userIds,
                reviewer_ids: reviewerIds,
                branch: options.branch,
            }),
        );
    }

    const responses = await Promise.all(promises);
    const data = responses.map(getResponseData);

    return data;
};

// ---------- Locale ----------
type ListFunctionOptions = {
    /** Page number */
    page?: number;
    /** Limit on the number of objects to be returned, between 1 and 100. 25 by default */
    perPage?: number;
    /** specify the branch to use */
    branch?: string;
};

type GetProjectLocalesOptions = ListFunctionOptions & {
    sortBy?: string;
};
/**
 * Get project locales
 */
export const getProjectLocales = async (
    options: GetProjectLocalesOptions = {},
): Promise<
    {
        id: string;
        name: string;
        code: string;
        default: boolean;
        created_at: Date;
        updated_at: Date;
        [key: string]: any;
    }[]
> => {
    const { page = 1, perPage = 100, sortBy, branch } = options;
    const resp = await phraseClient?.({
        method: 'GET',
        url: `/projects/${PHRASE_PROJECT_ID}/locales`,
        params: {
            page,
            per_page: perPage,
            sort_by: sortBy,
            branch,
        },
    });

    return getResponseData(resp);
};

/**
 * Get all keys of specified locale
 */
export const getLocaleKeys = async (options?: {
    localeId: string;
    tags?: string[];
    branch?: string;
    total: number;
}): Promise<
    {
        id: string;
        name: string;
        tags: string[];
        description: string;
        created_at: Date;
        updated_at: Date;
    }[]
> => {
    const { total = 100, branch } = options || {};
    const reqParams: Record<string, any> = {
        branch,
        order: 'desc',
        sort: 'created_at',
    };

    if (options.tags) {
        reqParams.q = `tags:${options.tags.join(',')}`;
    }

    const promises = [];
    const count = Math.ceil(total / MAX_PER_PAGE);
    for (let i = 1; i <= count; i++) {
        const perPage = i !== count ? MAX_PER_PAGE : total % MAX_PER_PAGE || total;
        promises.push(
            phraseClient?.({
                method: 'GET',
                url: `/projects/${PHRASE_PROJECT_ID}/keys`,
                params: {
                    ...reqParams,
                    page: i,
                    per_page: perPage,
                },
            }),
        );
    }

    const responses = await Promise.all(promises);
    const data = responses.map(getResponseData);

    return data.flat();
};

/**
 * Download specific locale by locale id
 */
export const downloadLocales = async (options: {
    branch?: string;
    localeIds: string[];
    fileFormat?: string;
    fallbackLocaleId?: string;
}) => {
    const { branch, localeIds, fileFormat = 'simple_json', fallbackLocaleId = 'en' } = options;
    const promises = [];
    for (const localeId of localeIds) {
        promises.push(
            phraseClient?.get(`/projects/${PHRASE_PROJECT_ID}/locales/${localeId}/download`, {
                params: {
                    branch,
                    file_format: fileFormat,
                    include_empty_translations: true,
                    fallback_locale_id: fallbackLocaleId,
                },
            }),
        );
    }
    const responses = await Promise.all(promises);
    const data = responses.map(getResponseData);
    return data;
};

/**
 * Upload locale
 */
export const uploadLocale = async (options: {
    localeId: string;
    fileName: string;
    version: string;
    branch?: string;
    contents: string;
}): Promise<{
    id: string;
    filename: string;
    format: string;
    state: string;
    url: string;
    created_at: Date;
    updated_at: Date;
    [key: string]: any;
}> => {
    const data = {
        tags: [options.version],
        file: new File([options.contents], options.fileName, { type: 'application/json' }),
        locale_id: options.localeId,
        file_format: 'simple_json',
    };

    const formData = new FormData();
    Object.keys(data).forEach(key => {
        if (data[key]) formData.append(key, data[key]);
    });

    const resp = await phraseClient?.({
        method: 'POST',
        url: `/projects/${PHRASE_PROJECT_ID}/uploads`,
        data: formData,
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });

    return getResponseData(resp);
};

/**
 * Get upload success status
 */
export const getUploadSuccessStatus = async (
    uploadId?: string,
): Promise<{
    id: string;
    filename: string;
    format: string;
    state: 'processing' | 'success' | 'error';
    summary: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}> => {
    if (!uploadId) return;
    let tryCount = 60;
    const getUploadStatus = async (
        resolve: (...args: any[]) => void,
        reject: (...args: any[]) => void,
    ) => {
        const resp = await phraseClient?.get(`/projects/${PHRASE_PROJECT_ID}/uploads/${uploadId}`);
        const data = getResponseData(resp);

        if (data.state !== 'success') {
            tryCount -= 1;
            if (tryCount <= 0) {
                reject(new Error('Upload failed'));
                return;
            }
            await delay(1000);
            await getUploadStatus(resolve, reject);
            return;
        }

        resolve(data);
    };

    return new Promise((resolve, reject) => {
        getUploadStatus(resolve, reject);
    });
};
