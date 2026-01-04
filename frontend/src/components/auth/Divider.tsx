function Divider() {
  return (
    <div className="relative font-reg">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200"></div>
      </div>
      <div className="relative flex justify-center text-sm">
        <span className="px-4 bg-gray-50 text-gray-500 font-med">
          Or continue with
        </span>
      </div>
    </div>
  );
}

export default Divider;