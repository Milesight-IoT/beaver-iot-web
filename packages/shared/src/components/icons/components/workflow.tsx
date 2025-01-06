import { createSvgIcon } from '@mui/material/utils';

const WorkflowIcon = createSvgIcon(
    <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={0.2}
    >
        <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6 9C7.30622 9 8.41746 8.16519 8.82929 7H17C18 7 19 7.8 19 9C19 10.2 18 11 17 11L7 11C5 11 3 12.6 3 15C3 17.4 5 19 7 19H15.1707C15.5825 20.1652 16.6938 21 18 21C19.6569 21 21 19.6569 21 18C21 16.3431 19.6569 15 18 15C16.6938 15 15.5825 15.8348 15.1707 17H7C6 17 5 16.1898 5 15C5 13.8102 6 13 7 13L17 13C19 13 21 11.4 21 9C21 6.6 19 5 17 5L8.82929 5C8.41746 3.83481 7.30622 3 6 3C4.34315 3 3 4.34315 3 6C3 7.65685 4.34315 9 6 9Z"
        />
    </svg>,
    'WorkflowIcon',
);

export default WorkflowIcon;
