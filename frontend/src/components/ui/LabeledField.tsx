interface LabeledFieldProps {
  title: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  errorMessage?: string;
  required?: boolean;
  children?: React.ReactNode;
}

function LabeledField({
  title,
  type,
  placeholder,
  value,
  onChange,
  errorMessage,
  required = false,
  children,
}: LabeledFieldProps) {
  return (
    <div className="group">
      <div className="relative flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <label className="text-black font-reg text-sm">{title}</label>
          <div className="h-4 flex items-center">
            <span
              className={`text-xs text-red-500 transition-all duration-300 ease-in-out font-light ${
                errorMessage
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 -translate-y-2"
              }`}
            >
              {errorMessage || "\u00A0"}
            </span>
          </div>
        </div>
        <input
          type={type}
          required={required}
          className="peer h-12 px-4 py-4 mt-1 bg-white/80 backdrop-blur-sm border-2 border-gray-200/60 rounded-2xl text-black text-sm font-reg"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        {children}
      </div>
    </div>
  );
}

export default LabeledField;

//Test commit