import * as SI from "react-icons/si";
import * as FA from "react-icons/fa";
import { MdAccountCircle } from "react-icons/md";

/**
 * Converts account_type string → icon component
 * Examples:
 *  google -> SiGoogle
 *  github -> SiGithub
 *  aws -> SiAmazonaws
 *  facebook -> SiFacebook
 */
export const getAccountTypeIcon = (type, size = 18) => {
  if (!type) return <MdAccountCircle size={size} />;

  const key = type
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[^a-z]/g, "");

  const siKey = `Si${key.charAt(0).toUpperCase()}${key.slice(1)}`;
  const faKey = `Fa${key.charAt(0).toUpperCase()}${key.slice(1)}`;

  if (SI[siKey]) return SI[siKey]({ size });
  if (FA[faKey]) return FA[faKey]({ size });

  return <MdAccountCircle size={size} />;
};
