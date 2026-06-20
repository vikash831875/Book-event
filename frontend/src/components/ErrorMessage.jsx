const ErrorMessage = ({ message, onRetry }) => {
  if (!message) return null;

  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
      <p className="text-sm">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="text-sm font-medium underline ml-4">
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
