import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { db } from "@/db";
import { usersTable, stripeEventsTable } from "@/db/schema";
import { logger } from "@/lib/logger";

export const POST = async (request: Request) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    logger.error("stripe.webhook: STRIPE_SECRET_KEY missing", {
      module: "stripe.webhook",
      metadata: { level: "fatal" },
    });
    throw new Error("Stripe secret key not configured");
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    logger.error("stripe.webhook: STRIPE_WEBHOOK_SECRET missing", {
      module: "stripe.webhook",
      metadata: { level: "fatal" },
    });
    throw new Error("Stripe webhook secret not configured");
  }
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new Error("Stripe signature not found");
  }
  const text = await request.text();
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      text,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    logger.error("stripe.webhooks.constructEvent failed", err as Error);
    throw err;
  }

  logger.info("stripe.webhook.received", {
    correlationId: undefined,
    module: "stripe.webhook",
    metadata: { type: event.type },
  });

  try {
    // Idempotency check: has this event been processed?
    const existing = await db.query.stripeEventsTable.findFirst({
      where: eq(stripeEventsTable.id, event.id),
    });
    if (existing) {
      logger.info("stripe.webhook: event already processed", {
        module: "stripe.webhook",
        metadata: { eventId: event.id, eventType: event.type },
      });
      return NextResponse.json({ received: true });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        logger.info("stripe.event", {
          module: "stripe.webhook",
          metadata: {
            type: event.type,
            sessionId: session.id ?? null,
            customer: session.customer ?? null,
            metadata: session.metadata ?? null,
          },
        });
        const userId = session.metadata?.userId as string | undefined;
        if (!userId) {
          logger.warn(
            "stripe.webhook: checkout.session.completed missing userId",
            {
              module: "stripe.webhook",
              metadata: { sessionId: session.id ?? null, eventId: event.id },
            },
          );
          break;
        }
        const customer =
          typeof session.customer === "string"
            ? session.customer
            : session.customer?.id;
        const result = await db
          .update(usersTable)
          .set({
            stripeCustomerId: customer ?? null,
            plan: "PRO",
            planUpdatedAt: new Date(),
          })
          .where(eq(usersTable.id, userId));
        const updated =
          typeof result === "number"
            ? result
            : ((result as any)?.rowCount ?? null);
        if (updated !== 1) {
          logger.error("stripe.webhook: failed to update user plan", {
            module: "stripe.webhook",
            metadata: { eventId: event.id, userId, updated, level: "fatal" },
          });
        } else {
          logger.info("stripe.webhook: user plan updated", {
            module: "stripe.webhook",
            metadata: {
              eventId: event.id,
              eventType: event.type,
              userId,
              stripeCustomerId: customer ?? null,
              processedAt: new Date().toISOString(),
            },
          });
        }
        break;
      }
      case "invoice.paid": {
        const invoice = event.data.object as Stripe.Invoice;
        logger.info("stripe.event", {
          module: "stripe.webhook",
          metadata: {
            type: event.type,
            invoiceId: invoice.id ?? null,
            customer: invoice.customer ?? null,
            metadata: invoice.metadata ?? null,
            subscription: (invoice as any).subscription ?? null,
          },
        });
        let userId: string | undefined = undefined;
        const invoiceSub = (invoice as any).subscription;
        // Try invoice metadata first
        if (invoice.metadata && (invoice.metadata as any).userId) {
          userId = (invoice.metadata as any).userId as string;
        }
        // If subscription id present, fetch subscription metadata
        if (!userId && invoiceSub) {
          try {
            const subscriptionId =
              typeof invoiceSub === "string"
                ? invoiceSub
                : (invoiceSub as any).id;
            const subscription =
              await stripe.subscriptions.retrieve(subscriptionId);
            // Validate subscription status before trusting
            if (
              subscription &&
              subscription.metadata &&
              (subscription.metadata as any).userId
            ) {
              // ensure active and not expired
              const statusOk = subscription.status === "active";
              const periodEnd = (subscription as any).current_period_end
                ? new Date(
                    ((subscription as any)
                      .current_period_end as unknown as number) * 1000,
                  )
                : null;
              const notExpired = periodEnd
                ? periodEnd.getTime() > Date.now()
                : true;
              if (statusOk && notExpired) {
                userId = (subscription.metadata as any).userId as string;
              } else {
                logger.warn(
                  "stripe.webhook: subscription not active or expired",
                  {
                    module: "stripe.webhook",
                    metadata: {
                      eventId: event.id,
                      subscriptionId,
                      status: subscription.status,
                      periodEnd,
                    },
                  },
                );
              }
            }
          } catch (e) {
            logger.warn("stripe.webhook: failed to retrieve subscription", {
              module: "stripe.webhook",
              metadata: { invoiceId: invoice.id ?? null },
            });
          }
        }
        // If still no userId, try to resolve by stripe customer id
        if (!userId) {
          const customer =
            typeof invoice.customer === "string"
              ? invoice.customer
              : invoice.customer?.id;
          if (customer) {
            const found = await db.query.usersTable.findFirst({
              where: eq(usersTable.stripeCustomerId, customer),
            });
            if (found) {
              userId = found.id;
              logger.info("stripe.webhook: resolved user by stripeCustomerId", {
                module: "stripe.webhook",
                metadata: {
                  eventId: event.id,
                  stripeCustomerId: customer,
                  userId,
                },
              });
            }
          }
        }
        if (!userId) {
          logger.warn(
            "stripe.webhook: invoice.paid missing userId after fallbacks",
            {
              module: "stripe.webhook",
              metadata: { invoiceId: invoice.id ?? null, eventId: event.id },
            },
          );
          break;
        }
        const customer =
          typeof invoice.customer === "string"
            ? invoice.customer
            : invoice.customer?.id;
        const subscriptionIdVal = invoiceSub
          ? typeof invoiceSub === "string"
            ? invoiceSub
            : (invoiceSub as any).id
          : null;

        const result = await db
          .update(usersTable)
          .set({
            stripeSubscriptionId: subscriptionIdVal ?? null,
            stripeCustomerId: customer ?? null,
            plan: "PRO",
            planUpdatedAt: new Date(),
          })
          .where(eq(usersTable.id, userId));
        const updated =
          typeof result === "number"
            ? result
            : ((result as any)?.rowCount ?? null);
        if (updated !== 1) {
          logger.error(
            "stripe.webhook: failed to update user plan for invoice.paid",
            {
              module: "stripe.webhook",
              metadata: { eventId: event.id, userId, updated, level: "fatal" },
            },
          );
        } else {
          logger.info("stripe.webhook: invoice.paid applied, user updated", {
            module: "stripe.webhook",
            metadata: {
              eventId: event.id,
              eventType: event.type,
              userId,
              stripeCustomerId: customer ?? null,
              stripeSubscriptionId: subscriptionIdVal ?? null,
              processedAt: new Date().toISOString(),
            },
          });
        }
        break;
      }
      case "customer.subscription.deleted": {
        if (!event.data.object.id) {
          throw new Error("Subscription ID not found");
        }
        const subscription = await stripe.subscriptions.retrieve(
          event.data.object.id,
        );
        if (!subscription) {
          throw new Error("Subscription not found");
        }
        const userId = subscription.metadata.userId;
        if (!userId) {
          throw new Error("User ID not found");
        }
        const result = await db
          .update(usersTable)
          .set({
            stripeSubscriptionId: null,
            stripeCustomerId: null,
            plan: null,
            planUpdatedAt: new Date(),
          })
          .where(eq(usersTable.id, userId));
        const updated =
          typeof result === "number"
            ? result
            : ((result as any)?.rowCount ?? null);
        if (updated !== 1) {
          logger.error(
            "stripe.webhook: failed to clear user plan on subscription.deleted",
            {
              module: "stripe.webhook",
              metadata: { eventId: event.id, userId, updated, level: "fatal" },
            },
          );
        } else {
          logger.info(
            "stripe.webhook: subscription.deleted applied, user cleared",
            {
              module: "stripe.webhook",
              metadata: {
                eventId: event.id,
                userId,
                processedAt: new Date().toISOString(),
              },
            },
          );
        }
      }
    }
    // mark event processed for idempotency
    try {
      await db
        .insert(stripeEventsTable)
        .values({ id: event.id, type: event.type, createdAt: new Date() });
    } catch (e) {
      logger.warn("stripe.webhook: failed to insert stripe_events record", {
        module: "stripe.webhook",
        metadata: { eventId: event.id },
      });
    }
  } catch (err) {
    logger.error("stripe.webhook.processing_error", err as Error);
    throw err;
  }
  return NextResponse.json({
    received: true,
  });
};
