export interface HoverSearchInputProps {
    inputWidth?: number;
    keyword: string;
    changeKeyword: (newVal: string) => void;
    placeholder?: string;
}
