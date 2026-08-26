export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-8 text-xs text-zinc-500 select-none lg:pb-8">
      <div className="max-w-2xl mx-auto px-4 flex justify-end items-center text-right">
        <span>{currentYear} • Build with ☕ by <a href="https://rakhafausta.my.id" target="_blank" rel="noopener noreferrer" className="underline">Rakha.</a></span>
      </div>
    </footer>
  );
}
