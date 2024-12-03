import { Link } from 'react-router-dom';
import cls from 'classnames';
import './style.less';

interface Props {
    /** 跳转地址 */
    to?: string;

    /** 是否为 Mini Logo */
    mini?: boolean;

    /** 占位符 */
    placeholder?: string;

    /** 自定义类名 */
    className?: string;
}

/**
 * Logo 组件
 */
const Logo: React.FC<Props> = ({ to, mini, className, placeholder = 'Milesight' }) => {
    return (
        <h3 className={cls('ms-logo', className, { 'ms-logo-mini': mini })}>
            {!to ? (
                <span className="ms-logo-inner">{placeholder}</span>
            ) : (
                <Link className="ms-logo-inner" to={to}>
                    {placeholder}
                </Link>
            )}
        </h3>
    );
};

export default Logo;
