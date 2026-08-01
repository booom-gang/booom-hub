import GalleryItemCard from './GalleryItemCard.jsx';

const GalleryGrid = ({ items, onDelete, onPreview }) => {
  if (items.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-4xl mb-3">📷</p>
        <p className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>nothing here yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5">
      {items.map((item, index) => (
        <GalleryItemCard key={item._id} item={item} onDelete={onDelete} onPreview={onPreview} index={index} />
      ))}
    </div>
  );
};

export default GalleryGrid;
