import React from 'react';
import cls from 'classnames';
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
    const hasChildren = React.Children.toArray(children).length > 0;

    return (
        <Accordion className="ms-log-accordion">
            <AccordionSummary
                classes={{
                    expandIconWrapper: cls({
                        'ms-log-accordion__icon--hidden': !hasChildren,
                    }),
                }}
                expandIcon={<ArrowForwardIosIcon />}
                className="ms-log-accordion__header"
            >
                {header}
            </AccordionSummary>
            {hasChildren && (
                <AccordionDetails className="ms-log-accordion__content">
                    {children}
                </AccordionDetails>
            )}
        </Accordion>
    );
});
