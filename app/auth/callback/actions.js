"use server"

import { createClient } from "@/utils/superbase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { scrapeproduct } from "@/lib/firecrawl";
// import { NextResponse } from "next/server";
export async function signOut(request) {
    const superbase =await createClient();
    await superbase.auth.signOut();
    revalidatePath("/");
    redirect("/");

}

export async function addProduct(formdata) {
    const url = formdata.get("url");
    if (!url) {
        return { error: "Invalid URL" };
    }
    try {
        const superbase = await createClient();
        const { data: {user}, } = await superbase.auth.getUser();
        if (!user) {
            return { error: "Unauthorized" };
        }


        // Scrap the product data using firecrawl


        const productData = await scrapeproduct(url); 
        if (!productData.productName || !productData.currentPrice) {
            console.log("productData", productData);
            return{ error: "Failed to extract product data."}
        }
        
        const newPrice = parseFloat(productData.currentPrice);
        const currency = productData.currencyCode || "USD";

        const { data: existingProduct } = await superbase
          .from("products")
          .select("id,current_price")
          .eq("url", url)
          .eq("user_id", user.id)
          .single();

         const isUpdate = !!existingProduct; 
         const {data:product,error} = await superbase.from("products").upsert({
            user_id: user.id,
            url,
            name: productData.productName,
            current_price: newPrice,
            currency: currency,
            image_url: productData.productImageUrl,
            updated_at: new Date().toISOString(),
         },{
            conflict: "user_id,url",
            ignoreDuplicates: false,
         }).select().single();
         if (error) throw error;
         const shouldRevalidate = !isUpdate || (existingProduct.current_price !== newPrice);

         if (shouldRevalidate) {
            await superbase.from("price_history").insert({
                product_id: product.id,
                price: newPrice,
                currency: currency,
            });
        }
            revalidatePath("/");
        return { message: isUpdate ? "Product updated successfully!" : "Product added successfully!" };
         

    } catch (error) {
        console.error("Error adding product:", error);
        return { error: error.message || "Failed to add product." };

    }


}


export async function deleteProduct(productId) {
    const superbase = await createClient()
    const { data: { user } } = await superbase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }
    try {
        const { error } = await superbase.from("products").delete().eq("id", productId);
        if (error) {
            throw error;
        }
        revalidatePath("/");
        return { success: true };
    } catch (error) {
        console.error("Error deleting product:", error);
        return { error: "Failed to delete product." };
    }
}



export async function getProducts(productId){
    
    const superbase = await createClient()
    const { data: { user } } = await superbase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }
    try {
        const { data, error } = await superbase
            .from("products")
            .select("*")
            .order("created_at", { ascending: false });
        if (error) {
            throw error;
        }
        return data || [];
    } catch (error) {
        console.error("Error in Getting product:", error);
        return [];
    }

} 

export async function priceHistory(productId){
    const superbase = await createClient()
    const { data: { user } } = await superbase.auth.getUser();
    if (!user) {
        return { error: "Unauthorized" };
    }
    try {
        const { data, error } = await superbase.from("price_history").select("*").eq("product_id", productId).order("checked_at", {ascending: false});
        if (error) {
            throw error;
        }
        return data || [];
    } catch (error) {
        console.error("Error in Getting price history:", error);
        return [];
    }
}

