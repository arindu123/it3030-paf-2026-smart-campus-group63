export default function Footer() {
  return (
    <footer className="bg-white border-t mt-10">
      <div className="max-w-7xl mx-auto px-6 py-8 text-center">

        <h2 className="text-lg font-semibold text-blue-600 mb-2">
          Smart Campus
        </h2>

        <p className="text-sm text-gray-500 mb-4">
          Manage bookings, facilities, and campus operations efficiently.
        </p>

        <div className="flex justify-center space-x-6 text-sm mb-4">
          <a href="#" className="hover:text-blue-600">About</a>
          <a href="#" className="hover:text-blue-600">Contact</a>
          <a href="#" className="hover:text-blue-600">Support</a>
        </div>

        <p className="text-xs text-gray-400">
          © 2026 Smart Campus System. All rights reserved.
        </p>

      </div>
    </footer>
  );
}