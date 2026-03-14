import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Currency } from "lucide-react";
import { sendPriceDropAlert } from "@/lib/email";

export async function GET() {
  return NextResponse.json({
    message: "Cron job to check prices executed successfully. Use POST trigger",
  });
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("Authorization");
    const secret = process.env.CRON_SECRET;

    if (!authHeader || authHeader !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Use Supabase service role key to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPERBASE_SERVICE_ROLE_KEY,
    );

    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("*");

    if (productsError) {
      throw productsError;
    }
    console.log(`Found ${products.length} products to check.`);

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

        if (!productData.productName || !productData.currentPrice) {
          results.failed++;
          continue;
        }
        const newPrice = parseFloat(productData.currentPrice);
        const oldPrice = parseFloat(product.current_Price);

        await supabase
          .from("products")
          .update({
            current_Price: newPrice,
            Currency: productData.currencyCode || product.Currency,
            name: productData.productName || product.name,
            image_url: productData.productimageUrl || product.image_url,
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
          if (newPrice < oldPrice) {
            const { data: users, error: usersError } =
              await supabase.auth.admin.getUserById(product.user_id);
            if (users?.email) {
              const emailResult = await sendPriceDropAlert(
                users.email,
                product,
                oldPrice,
                newPrice
              );
                if (emailResult.success) {
                    results.alertsSent++;
                }
            }
          }
        }

        results.updated++;
      } catch (error) {
        console.error(`Failed to check product ${product.id}:`, error);
        results.failed++;
      }
    }

    return NextResponse.json({ success: true, message: "Price check completed", results });

  } catch (error) {
    console.error("Error in cron job:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
