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
  latitude: string;
  longitude: string;
}

/* --------------- helpers ---------------- */
const toObject = (raw: any): Record<string, any> =>
  raw && typeof raw === "object" ? raw : {};

const field =
  "bg-[#0b1220] text-slate-200 placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
      <div className="min-h-screen bg-[#0b1220] flex items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <Card className="border border-slate-800 bg-[#0f172a]/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <CardTitle className="text-2xl text-slate-100">
                  Edit Property
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card className="border border-slate-800 bg-[#0f172a]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Info */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Basic Information
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-slate-300">
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
                    <Label htmlFor="propertyType" className="text-slate-300">
                      Property Type
                    </Label>
                    <Select
                      value={formData.propertyType}
                      onValueChange={(v) => handleChange("propertyType", v)}
                    >
                      <SelectTrigger className={field}>
                        <SelectValue placeholder="Select property type" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#0b1220] text-slate-200 border-slate-700">
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
                  <Label htmlFor="description" className="text-slate-300">
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
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Location
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-slate-300">
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
                    <Label htmlFor="city" className="text-slate-300">
                      City
                    </Label>
                    <Input
                      id="city"
                      className={field}
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      placeholder="Prishtinë"
                    />
                  </div>
                </div>
              </section>

              {/* Property Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Property Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-300">
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
                    <Label htmlFor="bedrooms" className="text-slate-300">
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
                    <Label htmlFor="bathrooms" className="text-slate-300">
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
                    <Label htmlFor="squareFeet" className="text-slate-300">
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
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">Status</h3>
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
                    <Label htmlFor="isForSale" className="text-slate-300">
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
                    <Label htmlFor="isForRent" className="text-slate-300">
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
                      className="text-slate-300"
                    >
                      Has Ownership Document
                    </Label>
                  </div>
                </div>
              </section>

              {/* Additional Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="furniture" className="text-slate-300">
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
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Coordinates
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="latitude" className="text-slate-300">
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
                    <Label htmlFor="longitude" className="text-slate-300">
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
              </section>

              {/* Submit */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/dashboard")}
                  disabled={loading}
                  className="border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-500/90 text-white shadow-md"
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
