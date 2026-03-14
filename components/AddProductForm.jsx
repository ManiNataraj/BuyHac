"use client";

import { useState } from "react";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { addProduct } from ".//../app/auth/callback/actions";
import AuthModal from "./AuthModal";

export default function AddProductForm({ user }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Guard: If user is not logged in, trigger auth modal instead of scraping
    if (!user) {
      setShowAuthModal(true);
      return;
    }

    if (!url) {
      toast.error("Please enter a valid product URL");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("url", url);

      const result = await addProduct(formData);

      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(result?.message || "Product tracked successfully!");
        setUrl(""); // Clear input on success
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
        <div className="flex flex-col sm:flex-row gap-2">
          <Input
            type="url"
            placeholder="Paste product link (Amazon, Zara, etc.)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            required
            className="h-12 text-base flex-grow bg-white"
          />
          <Button
            type="submit"
            disabled={loading}
            className="h-12 px-8 bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Tracking...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Track Price
              </>
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-3 text-center sm:text-left">
          We'll scrape the current price and notify you of any drops.
        </p>
      </form>

      {/* Auth Modal pop-up if triggered */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </>
  );
}