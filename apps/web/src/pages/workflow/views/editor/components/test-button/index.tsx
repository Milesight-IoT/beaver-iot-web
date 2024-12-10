import { ButtonGroup, Button, Popover } from '@mui/material';
import { useI18n } from '@milesight/shared/src/hooks';
import { PlayArrowIcon, HistoryIcon } from '@milesight/shared/src/components';
import './style.less';

export type ButtonType = 'test' | 'history';

interface Props {
    onClick?: (type: ButtonType) => void;
}

/**
 * Test Button
 */
const TestButton: React.FC<Props> = ({ onClick }) => {
    const { getIntlText } = useI18n();
    const handleClick = (type: ButtonType) => {
        onClick?.(type);
    };

    return (
        <ButtonGroup className="ms-workflow-test-button">
            <Button
                variant="outlined"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleClick('test')}
            >
                {getIntlText('common.label.test')}
            </Button>
            <Button variant="outlined" onClick={() => handleClick('history')}>
                <HistoryIcon />
            </Button>
        </ButtonGroup>
    );
};

export default TestButton;
