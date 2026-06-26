import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save } from "lucide-react";
import { apiUrl } from "@/lib/api";
import logoImage from "../assets/LogoMainSection.png";

/* ---------------- types ---------------- */
interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  propertyType: string;
  isForSale: boolean;
  isForRent: boolean;
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  furniture: string;
  hasOwnershipDocument: boolean;
  floorPlanUrl: string;
  virtualTourUrl: string;
  latitude: string;
  longitude: string;
}

/* --------------- helpers ---------------- */
const toObject = (raw: any): Record<string, any> =>
  raw && typeof raw === "object" ? raw : {};

const adminPage =
  "min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(18,56,36,0.95),#050705_48%,#020302_100%)] text-[#f5f0e8] p-4 md:p-8";
const adminPanel =
  "border border-real-estate-secondary/20 bg-[#0d1510]/95 shadow-2xl shadow-black/25";
const field =
  "rounded-none border-real-estate-secondary/20 bg-[#050705] text-[#f5f0e8] placeholder:text-[#f5f0e8]/30 focus:border-real-estate-secondary focus:ring-2 focus:ring-real-estate-secondary/20";
const sectionPanel =
  "space-y-4 border border-real-estate-secondary/15 bg-[#08150f] p-5";
const sectionTitle =
  "font-text text-xs font-bold uppercase tracking-[0.28em] text-real-estate-secondary";
const primaryGoldButton =
  "rounded-none border border-real-estate-secondary bg-real-estate-secondary px-6 py-5 font-text text-xs font-bold uppercase tracking-[0.2em] text-real-estate-primary hover:bg-[#f1d676]";
const outlineGoldButton =
  "rounded-none border-real-estate-secondary/40 bg-transparent px-5 py-5 font-text text-xs font-bold uppercase tracking-[0.2em] text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary";

/* --------------- component --------------- */
const EditProperty = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    address: "",
    city: "",
    propertyType: "",
    isForSale: true,
    isForRent: false,
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    furniture: "",
    hasOwnershipDocument: true,
    floorPlanUrl: "",
    virtualTourUrl: "",
    latitude: "",
    longitude: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const ac = new AbortController();

    (async () => {
      try {
        const url = apiUrl(`api/Property/GetProperty/${id}`);
        const res = await axios.get(url, {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });
        const d = toObject(res.data);

        setFormData({
          title: d.title ?? "",
          description: d.description ?? "",
          address: d.address ?? "",
          city: d.city ?? "",
          propertyType: d.propertyType ?? "",
          isForSale: !!d.isForSale,
          isForRent: !!d.isForRent,
          price: (d.price ?? "").toString(),
          bedrooms: (d.bedrooms ?? "").toString(),
          bathrooms: (d.bathrooms ?? "").toString(),
          squareFeet: (d.squareFeet ?? "").toString(),
          furniture: d.furniture ?? "",
          hasOwnershipDocument: !!d.hasOwnershipDocument,
          floorPlanUrl: d.floorPlanUrl ?? "",
          virtualTourUrl: d.virtualTourUrl ?? "",
          latitude: (d.latitude ?? "").toString(),
          longitude: (d.longitude ?? "").toString(),
        });
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        console.error(e);
        toast({
          title: "Error",
          description: "Failed to load property details. Please try again.",
          variant: "destructive",
        });
      } finally {
        setInitialLoading(false);
      }
    })();

    return () => ac.abort();
  }, [id, toast]);

  const handleChange = (
    name: keyof PropertyFormData,
    value: string | boolean
  ) => setFormData((p) => ({ ...p, [name]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setLoading(true);
      const url = apiUrl(`api/Property/PutProperty/${id}`);

      await axios.put(
        url,
        {
          ...formData,
          // backend expects numbers for these:
          price: (formData.price ?? "").toString().trim(),
          // numeric coercions
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          squareFeet: parseFloat(formData.squareFeet) || 0,
          latitude: parseFloat(formData.latitude) || 0,
          longitude: parseFloat(formData.longitude) || 0,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      toast({
        title: "Success",
        description: "Property updated successfully!",
      });
      navigate("/dashboard");
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to update property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#050705]">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-real-estate-secondary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className={adminPage}>
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <Card className={adminPanel}>
          <CardHeader className="p-5 md:p-6">
            <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <img src={logoImage} alt="Realo Real Estate" className="h-14 w-auto object-contain" />
                <div className="h-px w-full bg-real-estate-secondary/20 sm:h-12 sm:w-px" />
                <div>
                  <p className="font-text text-xs uppercase tracking-[0.32em] text-real-estate-secondary">
                    Admin Studio
                  </p>
                  <CardTitle className="mt-2 font-title text-4xl font-normal leading-none text-[#f5f0e8] md:text-5xl">
                    Edit Property
                  </CardTitle>
                </div>
              </div>
              <div>
                <Button
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  className={outlineGoldButton}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card className={adminPanel}>
          <CardContent className="p-5 md:p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <section className={sectionPanel}>
                <h3 className={sectionTitle}>
                  Listing Basics
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-[#f5f0e8]/75">
                      Property Title
                    </Label>
                    <Input
                      id="title"
                      className={field}
                      value={formData.title}
                      onChange={(e) => handleChange("title", e.target.value)}
                      placeholder="Beautiful Family Home"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="propertyType" className="text-[#f5f0e8]/75">
                      Property Type
                    </Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(v) => handleChange("propertyType", v)}
                    >
                      <SelectTrigger className={field}>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent className="border-real-estate-secondary/25 bg-[#050705] text-[#f5f0e8]">
                        <SelectItem value="House">House</SelectItem>
                        <SelectItem value="Apartment">Apartment</SelectItem>
                        <SelectItem value="Land">Land</SelectItem>
                        <SelectItem value="Store">Store</SelectItem>
                        <SelectItem value="Warehouse">Warehouse</SelectItem>
                        <SelectItem value="Building">Building</SelectItem>
                        <SelectItem value="Office">Office</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-[#f5f0e8]/75">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    className={`${field} min-h-[110px]`}
                    value={formData.description}
                    onChange={(e) =>
                      handleChange("description", e.target.value)
                    }
                    placeholder="Describe the property..."
                    rows={3}
                  />
                </div>
              </section>

              {/* Location */}
              <section className={sectionPanel}>
                <h3 className={sectionTitle}>
                  Location
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-[#f5f0e8]/75">
                      Address
                    </Label>
                    <Input
                      id="address"
                      className={field}
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[#f5f0e8]/75">
                      City
                    </Label>
                    <Input
                      id="city"
                      className={field}
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Pristina"
                    />
                  </div>
                </div>
              </section>

              {/* Property Details */}
              <section className={sectionPanel}>
                <h3 className={sectionTitle}>
                  Property Facts
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-[#f5f0e8]/75">
                      Price
                    </Label>
                    <Input
                      id="price"
                      className={field}
                      value={formData.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                      placeholder="500000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bedrooms" className="text-[#f5f0e8]/75">
                      Bedrooms
                    </Label>
                    <Input
                      id="bedrooms"
                      type="number"
                      className={field}
                      value={formData.bedrooms}
                      onChange={(e) => handleChange("bedrooms", e.target.value)}
                      placeholder="3"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bathrooms" className="text-[#f5f0e8]/75">
                      Bathrooms
                    </Label>
                    <Input
                      id="bathrooms"
                      type="number"
                      className={field}
                      value={formData.bathrooms}
                      onChange={(e) =>
                        handleChange("bathrooms", e.target.value)
                      }
                      placeholder="2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="squareFeet" className="text-[#f5f0e8]/75">
                      Square Feet
                    </Label>
                    <Input
                      id="squareFeet"
                      type="number"
                      className={field}
                      value={formData.squareFeet}
                      onChange={(e) =>
                        handleChange("squareFeet", e.target.value)
                      }
                      placeholder="1500"
                    />
                  </div>
                </div>
              </section>

              {/* Status */}
              <section className={sectionPanel}>
                <h3 className={sectionTitle}>Status</h3>
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isForSale"
                      checked={formData.isForSale}
                      onCheckedChange={(checked) => {
                        handleChange("isForSale", checked);
                        if (checked) handleChange("isForRent", false);
                      }}
                    />
                    <Label htmlFor="isForSale" className="text-[#f5f0e8]/75">
                      For Sale
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isForRent"
                      checked={formData.isForRent}
                      onCheckedChange={(checked) => {
                        handleChange("isForRent", checked);
                        if (checked) handleChange("isForSale", false);
                      }}
                    />
                    <Label htmlFor="isForRent" className="text-[#f5f0e8]/75">
                      For Rent
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasOwnershipDocument"
                      checked={formData.hasOwnershipDocument}
                      onCheckedChange={(checked) =>
                        handleChange("hasOwnershipDocument", checked)
                      }
                    />
                    <Label
                      htmlFor="hasOwnershipDocument"
                      className="text-[#f5f0e8]/75"
                    >
                      Has Ownership Document
                    </Label>
                  </div>
                </div>
              </section>

              {/* Additional Details */}
              <section className={sectionPanel}>
                <h3 className={sectionTitle}>
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="furniture" className="text-[#f5f0e8]/75">
                      Furniture
                    </Label>
                    <Input
                      id="furniture"
                      className={field}
                      value={formData.furniture}
                      onChange={(e) =>
                        handleChange("furniture", e.target.value)
                      }
                      placeholder="Fully furnished"
                    />
                  </div>
                </div>
              </section>

              {/* Coordinates */}
              <section className={sectionPanel}>
                <h3 className={sectionTitle}>
                  Coordinates & Media
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-[#f5f0e8]/75">
                      Latitude
                    </Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      className={field}
                      value={formData.latitude}
                      onChange={(e) => handleChange("latitude", e.target.value)}
                      placeholder="42.6629"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude" className="text-[#f5f0e8]/75">
                      Longitude
                    </Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      className={field}
                      value={formData.longitude}
                      onChange={(e) =>
                        handleChange("longitude", e.target.value)
                      }
                      placeholder="21.1655"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="floorPlanUrl" className="text-[#f5f0e8]/75">
                      Floor Plan URL
                    </Label>
                    <Input
                      id="floorPlanUrl"
                      type="url"
                      className={field}
                      value={formData.floorPlanUrl}
                      onChange={(e) =>
                        handleChange("floorPlanUrl", e.target.value)
                      }
                      placeholder="https://example.com/floor-plan.pdf"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="virtualTourUrl" className="text-[#f5f0e8]/75">
                      Pioneer Virtual Tour URL
                    </Label>
                    <Input
                      id="virtualTourUrl"
                      type="url"
                      className={field}
                      value={formData.virtualTourUrl}
                      onChange={(e) =>
                        handleChange("virtualTourUrl", e.target.value)
                      }
                      placeholder="https://pioneer-tour.example.com/index.html"
                    />
                  </div>
                </div>
              </section>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                  className={outlineGoldButton}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className={primaryGoldButton}
                >
                  {loading ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Update Property
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProperty;
