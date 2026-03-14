"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  ExternalLink, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  TrendingDown 
} from "lucide-react";
import { toast } from "sonner";
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteProduct } from ".//../app/auth/callback/actions";
import PriceChart from "./PriceChart";

export default function ProductCard({ product }) {
  const [showChart, setShowChart] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to stop tracking this product?")) return;

    setIsDeleting(true);
    try {
      const result = await deleteProduct(product.id);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Product removed successfully");
      }
    } catch (error) {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow bg-white overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex gap-4">
          {/* Product Image */}
          {product.image_url && (
            <div className="relative w-20 h-20 flex-shrink-0">
              <img
                src={product.image_url}
                alt={product.name}
                className="object-cover rounded-md border w-full h-full"
              />
            </div>
          )}

          <div className="flex-grow min-w-0">
            <h3 className="font-semibold text-gray-900 line-clamp-2 text-sm mb-2">
              {product.name}
            </h3>
            
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-orange-600">
                {product.currency} {product.current_price}
              </span>
            </div>

            <Badge variant="secondary" className="mt-1 gap-1 bg-green-50 text-green-700 hover:bg-green-50">
              <TrendingDown className="w-3 h-3" />
              Tracking
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-2">
        <div className="flex items-center gap-2">
          {/* Toggle Chart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="flex-1 gap-1"
          >
            {showChart ? (
              <> <ChevronUp className="w-4 h-4" /> Hide Chart </>
            ) : (
              <> <ChevronDown className="w-4 h-4" /> Show History </>
            )}
          </Button>

          {/* External Link */}
          <Button variant="outline" size="sm" asChild>
            <Link href={product.url} target="_blank">
              <ExternalLink className="w-4 h-4" />
              View Product
            </Link>
          </Button>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />Remove
          </Button>
        </div>
      </CardContent>

      {/* Conditionally Render Price Chart */}
      {showChart && (
        <CardFooter className="p-4 pt-0 flex-col border-t bg-gray-50/50">
          <div className="w-full h-[200px] mt-4">
            <PriceChart productId={product.id} />
          </div>
        </CardFooter>
      )}
    </Card>
  );
}