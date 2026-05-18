export default function FloatingReward({ text }) {
  return (
    <div   className="
    animate-reward
    px-4 py-2
    rounded-full

    text-white
    font-semibold
    text-sm

    bg-black/60
    border border-white/20

    shadow-[0_0_25px_rgba(255,255,255,0.25)]
    backdrop-blur-md

    scale-110
    ">
      ✨ {text}
    </div>
  );
}