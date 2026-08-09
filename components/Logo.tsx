export default function Logo() {
  return (
    <div
      className="flex items-center gap-4 bg-transparent select-none font-sans"
      style={{ width: "fit-content" }}
    >
      {/* Typography Layout */}
      <div className="flex justify-center leading-none tracking-tight">
        <span className="text-[20px] font-bold text-[#007FD6]">Easy</span>
        <span className="text-[20px] font-extrabold text-[#2C3E50]">
          Invoice
        </span>
      </div>
    </div>
  );
}
