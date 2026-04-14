import LogoutButton from '@/components/auth/LogoutButton'

export default function InactivePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="w-full max-w-md rounded-lg border border-yellow-200 bg-yellow-50 p-6 shadow-sm text-center">
        <h2 className="mb-4 text-2xl font-bold text-yellow-800">Your service is inactive</h2>
        <p className="text-yellow-700 mb-6">
          You currently do not have an active service plan. Please contact support or upgrade your account to access the dashboard.
        </p>
        <LogoutButton className="inline-flex justify-center rounded-md border border-transparent bg-yellow-600 px-6 py-2 text-sm font-medium text-black shadow-sm hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2" />
      </div>
    </main>
  )
}
