'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/navbar';
import { api } from '@/lib/api';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/catalog/public/products'),
      api.get('/catalog/public/categories'),
    ])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name
        .toLowerCase()
        .includes(query.toLowerCase());

      const matchesCategory =
        !categoryId || product.categoryId === categoryId;

      return matchesSearch && matchesCategory;
    });
  }, [products, query, categoryId]);

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <Navbar />

      <section className="mx-auto max-w-7xl px-5 py-14">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
              Catalog
            </p>

            <h1 className="mt-2 text-5xl font-black tracking-tight">
              Discover products
            </h1>

            <p className="mt-3 text-slate-500">
              Browse products, variants and currently available stock.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="min-w-64 rounded-2xl border border-slate-200 bg-white px-4 py-3"
              placeholder="Search products..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              <option value="">All categories</option>

              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading && (
          <div className="mt-12 text-slate-500">
            Loading products...
          </div>
        )}

        {!loading && (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((product) => {
              const variant = product.variants?.[0];

              return (
                <Link
                  key={product.id}
                  href={`/shop/${product.slug}`}
                  className="group overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="grid aspect-[4/3] place-items-center bg-gradient-to-br from-slate-100 to-slate-200">
                    <span className="text-6xl font-black text-slate-300">
                      {product.name?.slice(0, 1)}
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {product.category?.name || 'Product'}
                    </p>

                    <h2 className="mt-2 text-lg font-black">
                      {product.name}
                    </h2>

                    <p className="mt-2 line-clamp-2 text-sm text-slate-500">
                      {product.shortDescription || product.description}
                    </p>

                    <div className="mt-5 flex items-end justify-between">
                      <p className="text-xl font-black">
                        {variant
                          ? `BDT ${variant.salePrice || variant.price}`
                          : 'View options'}
                      </p>

                      <p className="text-xs font-bold text-slate-400">
                        {variant?.stock ?? 0} available
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="mt-12 rounded-3xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
            No products found.
          </div>
        )}
      </section>
    </main>
  );
}
