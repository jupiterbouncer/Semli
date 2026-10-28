export default function CategoryTabs({ categories, active, onChange, label }) {
  return <div className="category-tabs" role="tablist" aria-label={label}>
    {categories.map((category) => <button key={category.id} id={`${category.id}-tab`} type="button" role="tab" aria-selected={active === category.id} aria-controls={`${category.id}-panel`} tabIndex={active === category.id ? 0 : -1} className={active === category.id ? 'category-tab category-tab--active' : 'category-tab'} onClick={() => onChange(category.id)}>{category.label}</button>)}
  </div>
}
