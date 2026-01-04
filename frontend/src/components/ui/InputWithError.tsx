import type React from "react";
import { Input } from "./input";
import { Label } from "./label";

type LabelType = "normal" | "uppercase";

interface InputWithErrorProps {
  id: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  errorMessage: string | undefined;
  title: string;
  labelType: LabelType;
  inputType: string;
  classes?: string;
  disabled?: boolean;
}

function InputWithError({
  title,
  labelType,
  inputType,
  id,
  value,
  onChange,
  placeholder,
  errorMessage,
  classes,
  disabled,
}: InputWithErrorProps) {
  return (
    <div className="space-y-2">
      <InputLabel htmlFor={id} type={labelType}>
        {title}
      </InputLabel>
      <Input
        type={inputType}
        id={id}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`${classes} ${
          errorMessage ? "border-red-500 focus-visible:ring-red-500" : ""
        }`}
      />
      {errorMessage && (
        <p className="text-xs text-red-600 font-medium">{errorMessage}</p>
      )}
    </div>
  );
}

export default InputWithError;

export function InputLabel({
  htmlFor,
  children,
  type,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  type: LabelType;
}) {
  const className =
    type === "uppercase"
      ? "text-xs font-semibold text-gray-500 uppercase tracking-wider"
      : "text-sm font-medium";

  return (
    <Label htmlFor={htmlFor} className={className}>
      {children}
    </Label>
  );
}
