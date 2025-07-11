import axios from 'axios';
import { logger } from '../utils/index';
import { PHRASE_WX_WORK_KEY } from '../config';

const url = `https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=${PHRASE_WX_WORK_KEY}`;

export const sendMessage = async (options: { content: string; mentionedMobiles?: string[] }) => {
    const { content, mentionedMobiles } = options;

    if (!mentionedMobiles?.length) {
        logger.error(`\n💥 The WX Work notification phone number cannot be empty`);
        return;
    }

    return axios({
        url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        data: {
            msgtype: 'text',
            text: {
                content,
                mentioned_mobile_list: mentionedMobiles,
            },
        },
    });
};
