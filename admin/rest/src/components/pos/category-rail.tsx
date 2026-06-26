import { Category } from '@/types';
import cn from 'classnames';
import Image from 'next/image';

interface CategoryRailProps {
  categories: Category[];
  activeSlug: string;
  onSelect: (slug: string) => void;
  loading?: boolean;
}

const ALL_SLUG = '';

const CategoryRail: React.FC<CategoryRailProps> = ({
  categories,
  activeSlug,
  onSelect,
  loading,
}) => {
  const renderButton = (
    key: string,
    slug: string,
    label: string,
    image?: string,
  ) => {
    const isActive = activeSlug === slug;
    return (
      <button
        key={key}
        type="button"
        onClick={() => onSelect(slug)}
        aria-pressed={isActive}
        className={cn(
          'flex w-full flex-col items-center gap-1.5 rounded-lg border px-2 py-3 text-center text-xs font-medium transition focus:outline-none focus:ring-2 focus:ring-accent-300',
          isActive
            ? 'border-accent bg-accent text-white shadow-sm'
            : 'border-border-200 bg-white text-body hover:border-accent hover:text-accent',
        )}
      >
        <span
          className={cn(
            'flex h-9 w-9 items-center justify-center overflow-hidden rounded-full text-sm font-bold',
            isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-heading',
          )}
        >
          {image ? (
            <Image src={image} alt={label} width={36} height={36} />
          ) : (
            label.charAt(0).toUpperCase()
          )}
        </span>
        <span className="line-clamp-2 leading-tight">{label}</span>
      </button>
    );
  };

  return (
    <aside className="flex h-full w-[110px] shrink-0 flex-col border-e border-border-200 bg-gray-50">
      <div className="border-b border-border-200 px-3 py-3 text-xs font-semibold uppercase tracking-wide text-muted">
        Categories
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-2">
        {renderButton('all', ALL_SLUG, 'All')}
        {categories.map((category) =>
          renderButton(
            category.id,
            category.slug,
            category.name,
            category.image?.thumbnail,
          ),
        )}
        {loading ? (
          <div className="px-2 py-4 text-center text-xs text-muted">
            Loading…
          </div>
        ) : null}
      </div>
    </aside>
  );
};

export default CategoryRail;
