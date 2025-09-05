import { createSvgIcon } from '@mui/material/utils';

const UncheckedCheckboxIcon = createSvgIcon(
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
            d="M4 5C4 4.44772 4.44772 4 5 4H19C19.5523 4 20 4.44772 20 5V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V5Z"
            fill="white"
        />
        <path
            d="M19 5V19H5V5H19ZM19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z"
            fill="currentColor"
        />
    </svg>,
    'UncheckedCheckboxIcon',
);

export default UncheckedCheckboxIcon;
