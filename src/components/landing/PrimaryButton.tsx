import { cn } from "@/lib/utils";

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const PrimaryButton = ({ children, className, ...props }: PrimaryButtonProps) => (
  <button
    className={cn(
      "inline-flex items-center justify-center gap-3 leading-tight min-h-12 rounded-full bg-primary px-8 py-3 font-body text-sm font-bold text-primary-foreground transition-all duration-300 hover:scale-105 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary motion-reduce:transition-none motion-reduce:hover:scale-100",
      className
    )}
    {...props}
  >
    {children}
  </button>
);

export default PrimaryButton;
