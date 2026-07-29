interface ErrorMessageProps { message: string; onRetry?: () => void }

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-center">
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 text-sm font-medium text-red-600 hover:text-red-500 underline">
          Try again
        </button>
      )}
    </div>
  )
}
