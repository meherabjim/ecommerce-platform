'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/navbar';
import OrderTrackingPanel from '@/components/order-tracking-panel';
import { api } from '@/lib/api';

type ReviewDraft = {
  rating: number;
  comment: string;
};

export default function OrderDetails() {
  const params = useParams<{ id: string }>();

  const [order, setOrder] = useState<any>(null);
  const [reviews, setReviews] = useState<any[]>([]);

  const [openVariantId, setOpenVariantId] =
    useState<string | null>(null);

  const [drafts, setDrafts] = useState<
    Record<string, ReviewDraft>
  >({});

  const [messages, setMessages] = useState<
    Record<string, string>
  >({});

  const [submitting, setSubmitting] =
    useState<string | null>(null);

  async function load() {
    const [orderResponse, reviewsResponse] =
      await Promise.all([
        api.get(`/me/orders/${params.id}`),
        api.get('/reviews/me'),
      ]);

    setOrder(orderResponse.data);
    setReviews(reviewsResponse.data || []);
  }

  useEffect(() => {
    load();
  }, [params.id]);

  const reviewedVariants = useMemo(() => {
    const map = new Map<string, any>();

    for (const review of reviews) {
      for (const variantId of review.variantIds || []) {
        map.set(variantId, review);
      }
    }

    return map;
  }, [reviews]);

  function getDraft(variantId: string): ReviewDraft {
    return (
      drafts[variantId] || {
        rating: 5,
        comment: '',
      }
    );
  }

  function updateDraft(
    variantId: string,
    values: Partial<ReviewDraft>,
  ) {
    setDrafts((current) => ({
      ...current,
      [variantId]: {
        ...getDraft(variantId),
        ...values,
      },
    }));
  }

  async function submitReview(
    event: FormEvent,
    variantId: string,
  ) {
    event.preventDefault();

    const draft = getDraft(variantId);

    setSubmitting(variantId);
    setMessages((current) => ({
      ...current,
      [variantId]: '',
    }));

    try {
      const response = await api.post('/reviews', {
        variantId,
        rating: draft.rating,
        comment: draft.comment.trim() || undefined,
      });

      setReviews((current) => [
        {
          ...response.data,
          variantIds: [variantId],
        },
        ...current,
      ]);

      setMessages((current) => ({
        ...current,
        [variantId]:
          'Review submitted successfully. It is waiting for admin approval.',
      }));

      setOpenVariantId(null);
    } catch (error: any) {
      setMessages((current) => ({
        ...current,
        [variantId]:
          error?.response?.data?.message ||
          'Could not submit review.',
      }));

      // Reload because a 409 may mean the review
      // already exists in the database.
      try {
        const response = await api.get('/reviews/me');
        setReviews(response.data || []);
      } catch {}
    } finally {
      setSubmitting(null);
    }
  }

  if (!order) {
    return (
      <main className="grid min-h-screen place-items-center bg-[#f7f7f5] text-slate-950">
        Loading order...
      </main>
    );
  }

  const delivered = order.status === 'DELIVERED';

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-slate-950">
      <Navbar />

      <div className="mx-auto max-w-5xl px-5 py-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
            Order
          </p>

          <h1 className="mt-2 text-4xl font-black">
            {order.orderNumber}
          </h1>

          {delivered && (
            <p className="mt-3 text-sm font-medium text-emerald-700">
              Delivered successfully. You can now review the
              products from this order.
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            ['Status', order.status],
            [
              'Payment',
              `${order.paymentMode} · ${order.paymentStatus}`,
            ],
            ['Total', `BDT ${order.total}`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="rounded-3xl border border-slate-200 bg-white p-5"
            >
              <p className="text-sm text-slate-500">
                {label}
              </p>

              <p className="mt-2 text-lg font-black">
                {value}
              </p>
            </div>
          ))}
        </div>

        {/* ==================================================
            ORDER ITEMS
        ================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-black">
                Items
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Products included in this order.
              </p>
            </div>

            {!delivered && (
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-500">
                Review available after delivery
              </span>
            )}
          </div>

          <div className="mt-4 divide-y divide-slate-200">
            {order.items.map((item: any) => {
              const existingReview =
                reviewedVariants.get(item.variantId);

              const draft = getDraft(item.variantId);

              const reviewOpen =
                openVariantId === item.variantId;

              return (
                <div
                  key={item.id}
                  className="py-6"
                >
                  <div className="flex flex-col justify-between gap-5 md:flex-row md:items-start">
                    <div className="min-w-0">
                      <p className="text-lg font-black">
                        {item.productName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {item.sku}
                        {Object.values(
                          item.attributes || {},
                        ).length > 0 &&
                          ` · ${Object.values(
                            item.attributes || {},
                          ).join(' / ')}`}
                      </p>

                      <p className="mt-2 text-sm text-slate-500">
                        Qty: {item.quantity}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                      <p className="font-black">
                        BDT {item.lineTotal}
                      </p>

                      {/* Already reviewed */}
                      {delivered && existingReview && (
                        <div className="text-left md:text-right">
                          <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                            ✓ Reviewed
                          </span>

                          <p className="mt-1 text-xs text-slate-500">
                            Status:{' '}
                            {existingReview.status}
                          </p>
                        </div>
                      )}

                      {/* Review button */}
                      {delivered && !existingReview && (
                        <button
                          type="button"
                          onClick={() =>
                            setOpenVariantId(
                              reviewOpen
                                ? null
                                : item.variantId,
                            )
                          }
                          className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-slate-800"
                        >
                          {reviewOpen
                            ? 'Cancel'
                            : 'Write Review'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* =================================================
                      REVIEW FORM
                  ================================================= */}

                  {delivered &&
                    !existingReview &&
                    reviewOpen && (
                      <form
                        onSubmit={(event) =>
                          submitReview(
                            event,
                            item.variantId,
                          )
                        }
                        className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5"
                      >
                        <div>
                          <p className="font-black">
                            Review {item.productName}
                          </p>

                          <p className="mt-1 text-sm text-slate-500">
                            Share your experience after
                            receiving this product.
                          </p>
                        </div>

                        <div className="mt-5">
                          <label className="text-sm font-bold">
                            Rating
                          </label>

                          <div className="mt-2 flex gap-2">
                            {[1, 2, 3, 4, 5].map(
                              (star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() =>
                                    updateDraft(
                                      item.variantId,
                                      {
                                        rating: star,
                                      },
                                    )
                                  }
                                  className="text-3xl leading-none transition hover:scale-110"
                                  aria-label={`${star} stars`}
                                >
                                  {star <=
                                  draft.rating
                                    ? '★'
                                    : '☆'}
                                </button>
                              ),
                            )}
                          </div>

                          <p className="mt-2 text-xs font-semibold text-slate-500">
                            {draft.rating} out of 5
                          </p>
                        </div>

                        <div className="mt-5">
                          <label className="text-sm font-bold">
                            Comment
                            <span className="ml-1 font-normal text-slate-400">
                              (optional)
                            </span>
                          </label>

                          <textarea
                            value={draft.comment}
                            onChange={(event) =>
                              updateDraft(
                                item.variantId,
                                {
                                  comment:
                                    event.target.value,
                                },
                              )
                            }
                            placeholder="How was the product?"
                            maxLength={1000}
                            className="mt-2 min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white p-3 text-sm outline-none transition focus:border-slate-950"
                          />

                          <p className="mt-1 text-right text-xs text-slate-400">
                            {draft.comment.length}/1000
                          </p>
                        </div>

                        <button
                          type="submit"
                          disabled={
                            submitting ===
                            item.variantId
                          }
                          className="mt-4 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {submitting ===
                          item.variantId
                            ? 'Submitting...'
                            : 'Submit Review'}
                        </button>
                      </form>
                    )}

                  {messages[item.variantId] && (
                    <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700">
                      {messages[item.variantId]}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <OrderTrackingPanel order={order} />

        {/* ==================================================
            STATUS TIMELINE
        ================================================== */}

        <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6">
          <h2 className="text-xl font-black">
            Status timeline
          </h2>

          <div className="mt-4 space-y-3">
            {order.history.map((item: any) => (
              <div
                key={item.id}
                className="border-l-2 border-slate-950 pl-4"
              >
                <p className="font-black">
                  {item.newStatus}
                </p>

                <p className="text-sm text-slate-500">
                  {item.note || 'Status updated'}
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

