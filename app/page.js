import Image from "next/image";
import { Button } from "@/components/ui/button";
import { LogIn,Rabbit, Shield, Bell ,TrendingDown } from "lucide-react";
import AddProductForm from "@/components/AddProductForm";
import AuthButton from "@/components/AuthButton";
import { createClient } from "@/utils/superbase/server";
import { getProducts } from ".//auth/callback/actions";
import ProductCard from "@/components/ProductCard";

export default async function Home() {
  const supabase = await createClient(); 

  // Now you can destructure the user safely
  const { data: { user } } = await supabase.auth.getUser();
  const products = user ? await getProducts() : [];
  const FEATURES =[
  
    {
      icon: Rabbit,
      title: "Lightning Fast",
      description: "Deal Drop extracts prices in seconds, handling JavaScript and dynamic content",
    },

    {
      icon: Shield,
      title: "Always Reliable",
      description: "Works across all major e-commerce sites with built-in anti-bot protection",
    },
    {
      icon: Bell,
      title: "Smart Alerts",
      description: "Get notified instantly when prices drop below your target",
    },
  ];
  return (
    <main className="min-h-screen bg-linear-to-br from-orange-100 via-white to-orange-100 ">
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex item-center gap-3">
            <Image
              src="/Shopping.png"
              alt="BuyHac Logo"
              width={600}
              height={200}
              className="h-10 w-auto"
            />
          </div>

          {/* Auth button */}
          <AuthButton user={user} />
        </div>
      </header>
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-6 py-2 rounded-full text-sm font-medium mb-6">
            {" "}
            Made for Easy to buy🛒🤸🏻‍♂️{" "}
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 tracking-tight">
            Track Prices, Save More
          </h1>

          <p className="text-lg text-gray-700 mb-12 mx-w-2xl mx-auto">
            Track price from any e-commerce site. And get instant alert when
            price drop. Save money Effectively{" "}
          </p>

          {/* Add Product Form Component */}
          <div className="max-w-2xl mx-auto mb-16">
            <AddProductForm user={user} />
          </div>

          {/* Features Grid (Shown if no products) */}
          {products.length === 0 && (
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-16 ">
              {FEATURES.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm"
                >
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-orange-500" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{title}</h3>
                  <p className="text-gray-600">{description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {user && products.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-20">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Your Tracked Products</h2>
          <span className="text-gray-600 mb-4 block">You have {products.length} {products.length === 1 ? "product" : "products"} being tracked.</span>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            {products.map((product) => (<ProductCard key={product.id} product={product} />))} 
          </div>

        
      </section>
      )}

      {user && products.length === 0 && (
        <section className="max-w-2x1 mx-auto px-4 pb-20 text-center">
          <div
            className="bg-white rounded-x1 border-2 border-dashed border-gray-300
             p-12"
          >
            <TrendingDown className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No products yet
            </h3>
            <p className="text-gray-600">
              Add your first product above to start tracking prices!
            </p>
          </div>
        </section>
      )}
    </main>
  );
}
