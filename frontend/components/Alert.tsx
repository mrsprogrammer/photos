interface AlertProps {
  type: "success" | "error";
  message: string;
}

export default function Alert({ type, message }: AlertProps) {
  const isSuccess = type === "success";

  return (
    <div className={`p-4 ${isSuccess ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"} border rounded-lg flex gap-3`}>
      <svg className={`h-5 w-5 ${isSuccess ? "text-green-600" : "text-red-600"} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
        {isSuccess ? <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /> : <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />}
      </svg>
      <p className={`text-sm font-medium ${isSuccess ? "text-green-800" : "text-red-800"}`}>{message}</p>
    </div>
  );
}
