import { ReactNode } from "react";

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  fullWidth?: boolean;
  noPadding?: boolean;
}

/**
 * Responsive page container that centers content on desktop
 * while maintaining full-width mobile layout
 */
const PageContainer = ({ 
  children, 
  className = "",
  fullWidth = false,
  noPadding = false
}: PageContainerProps) => {
  return (
    <div className={`
      w-full
      ${!fullWidth ? "lg:max-w-4xl xl:max-w-5xl lg:mx-auto" : ""}
      ${!noPadding ? "lg:px-6" : ""}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default PageContainer;
