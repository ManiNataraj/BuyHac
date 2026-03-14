import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendPriceDropAlert } from "@/lib/email";
import { scrapeproduct } from "@/lib/firecrawl";

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // FIX 1: Ensure spelling matches your Vercel Env Variables (SUPABASE vs SUPERBASE)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPERBASE_SERVICE_ROLE_KEY
    );

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) throw productsError;

    const results = {
      total: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      alertsSent: 0,
    };

    for (const product of products) {
      try {
        const productData = await scrapeproduct(product.url);

        // FIX 2: Check property names (productimageUrl vs productimageurl)
        if (!productData.productName || !productData.currentPrice) {
          console.error(`Scrape failed for product ${product.id}`);
          results.failed++;
          continue;
        }

        const newPrice = parseFloat(productData.currentPrice);
        // FIX 3: Match your DB column exactly (is it current_price or current_price?)
        const oldPrice = parseFloat(product.current_price || product.current_price);

        await supabase
          .from("products")
          .update({
            current_price: newPrice, // Ensure this matches your DB column casing
            updated_at: new Date().toISOString(),
          })
          .eq("id", product.id);

        if (newPrice !== oldPrice) {
          await supabase.from("price_history").insert({
            product_id: product.id,
            price: newPrice,
            currency: productData.currencyCode || product.Currency,
          });
          
          results.priceChanges++;

          // Only alert if price actually DROPPED
          if (newPrice < oldPrice) {
            const { data: authResponse, error: usersError } =
              await supabase.auth.admin.getUserById(product.user_id);

            // Supabase admin returns { user: { email: ... } }
            const userEmail = authResponse?.user?.email;

            if (userEmail) {
              const emailResult = await sendPriceDropAlert(
                userEmail,
                product,
                oldPrice,
                newPrice,
              );
              if (emailResult.success) results.alertsSent++;
            }
          }
        }
        results.updated++;
      } catch (error) {
        console.error(`Product ${product.id} loop error:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({ success: true, message: "Price check completed", results });
  } catch (error) {
    console.error("Critical Cron Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}