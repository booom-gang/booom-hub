const EventBadge = ({ count }) => {
  if (!count || count === 0) return null;

  return (
    <div
      className="absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white px-1"
      style={{ backgroundColor: 'var(--accent)' }}
    >
      {count > 9 ? '9+' : count}
    </div>
  );
};

export default EventBadge;
