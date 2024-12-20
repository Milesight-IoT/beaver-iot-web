import React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import { ArrowForwardIosIcon } from '@milesight/shared/src/components';
import './style.less';

interface IProps {
    header: React.ReactNode;
    children: React.ReactNode;
}
export default React.memo(({ header, children }: IProps) => {
    return (
        <Accordion className="ms-log-accordion">
            <AccordionSummary
                expandIcon={<ArrowForwardIosIcon />}
                className="ms-log-accordion__header"
            >
                {header}
            </AccordionSummary>
            <AccordionDetails className="ms-log-accordion__content">{children}</AccordionDetails>
        </Accordion>
    );
});
