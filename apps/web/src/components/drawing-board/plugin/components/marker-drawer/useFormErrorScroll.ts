import { useEffect } from 'react';
import { snakeCase } from 'lodash-es';

import type { UseFormStateReturn } from 'react-hook-form';

/**
 * Custom hook to scroll to the first form field with validation error
 * @param formState - The formState from useForm hook
 * @param containerSelector - Optional CSS selector for the scrollable container (default: scrolls the first error field into view)
 */
export function useFormErrorScroll(formState: UseFormStateReturn<any>, containerSelector?: string) {
    useEffect(() => {
        const { errors } = formState;

        // Get the first field with an error
        const firstErrorFieldName = Object.keys(errors)[0];

        if (!firstErrorFieldName) {
            return;
        }

        // Try to find the field element by its name attribute
        const errorElement = document.querySelector(
            `[data-identity="marker-drawer-form__${snakeCase(firstErrorFieldName)}"]`,
        );

        if (errorElement) {
            // Find the parent container or use the error element itself
            const container = containerSelector
                ? document.querySelector(containerSelector)
                : undefined;

            // Scroll the element into view
            errorElement.scrollIntoView({
                behavior: 'smooth',
                block: 'end',
                inline: 'center',
            });

            // If a container is specified and it's scrollable, also scroll the container
            if (container) {
                const elementRect = errorElement.getBoundingClientRect();
                const containerRect = container.getBoundingClientRect();

                // Check if element is not visible in the container
                if (
                    elementRect.top < containerRect.top ||
                    elementRect.bottom > containerRect.bottom
                ) {
                    container.scrollIntoView({
                        behavior: 'smooth',
                        block: 'end',
                        inline: 'center',
                    });
                }
            }
        }
    }, [formState, containerSelector]);
}

export default useFormErrorScroll;
