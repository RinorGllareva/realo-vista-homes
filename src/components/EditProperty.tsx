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

interface PropertyFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  isForSale: boolean;
  isForRent: boolean;
  price: string;
  bedrooms: string;
  bathrooms: string;
  squareFeet: string;
  isAvailable: boolean;
  orientation: string;
  furniture: string;
  heatingSystem: string;
  additionalFeatures: string;
  hasOwnershipDocument: boolean;
  spaces: string;
  floorLevel: string;
  country: string;
  neighborhood: string;
  builder: string;
  complex: string;
  latitude: string;
  longitude: string;
  exteriorVideo: string;
  interiorVideo: string;
}

const toObject = (raw: any): Record<string, any> => {
  if (raw && typeof raw === "object") return raw;
  return {};
};

const EditProperty = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState<PropertyFormData>({
    title: "",
    description: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    propertyType: "",
    isForSale: true,
    isForRent: false,
    price: "",
    bedrooms: "",
    bathrooms: "",
    squareFeet: "",
    isAvailable: true,
    orientation: "",
    furniture: "",
    heatingSystem: "",
    additionalFeatures: "",
    hasOwnershipDocument: true,
    spaces: "",
    floorLevel: "",
    country: "",
    neighborhood: "",
    builder: "",
    complex: "",
    latitude: "",
    longitude: "",
    exteriorVideo: "",
    interiorVideo: "",
  });

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  // shared dark-field classes
  const field =
    "bg-[#0b1220] text-slate-200 placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

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
        const data = toObject(res.data);

        setFormData({
          title: data.title ?? "",
          description: data.description ?? "",
          address: data.address ?? "",
          city: data.city ?? "",
          state: data.state ?? "",
          zipCode: data.zipCode ?? "",
          propertyType: data.propertyType ?? "",
          isForSale: !!data.isForSale,
          isForRent: !!data.isForRent,
          price: (data.price ?? "").toString(),
          bedrooms: (data.bedrooms ?? "").toString(),
          bathrooms: (data.bathrooms ?? "").toString(),
          squareFeet: (data.squareFeet ?? "").toString(),
          isAvailable: !!data.isAvailable,
          orientation: data.orientation ?? "",
          furniture: data.furniture ?? "",
          heatingSystem: data.heatingSystem ?? "",
          additionalFeatures: data.additionalFeatures ?? "",
          hasOwnershipDocument: !!data.hasOwnershipDocument,
          spaces: (data.spaces ?? "").toString(),
          floorLevel: (data.floorLevel ?? "").toString(),
          country: data.country ?? "",
          neighborhood: data.neighborhood ?? "",
          builder: data.builder ?? "",
          complex: data.complex ?? "",
          latitude: (data.latitude ?? "").toString(),
          longitude: (data.longitude ?? "").toString(),
          exteriorVideo: data.exteriorVideo ?? "",
          interiorVideo: data.interiorVideo ?? "",
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

  const handleChange = (name: string, value: string | boolean) =>
    setFormData((p) => ({ ...p, [name]: value }));

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
          // server may expect numbers (coerce safely)
          bedrooms: parseInt(formData.bedrooms) || 0,
          bathrooms: parseInt(formData.bathrooms) || 0,
          squareFeet: parseFloat(formData.squareFeet) || 0,
          spaces: parseInt(formData.spaces) || 0,
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
                        <SelectItem value="house">House</SelectItem>
                        <SelectItem value="apartment">Apartment</SelectItem>
                        <SelectItem value="condo">Condo</SelectItem>
                        <SelectItem value="townhouse">Townhouse</SelectItem>
                        <SelectItem value="commercial">Commercial</SelectItem>
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
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["address", "Address", "123 Main St"],
                    ["city", "City", "Prishtinë"],
                    ["state", "State", "KP"],
                    ["zipCode", "Zip Code", "10000"],
                    ["country", "Country", "Kosova"],
                    ["neighborhood", "Neighborhood", "Downtown"],
                  ].map(([key, label, ph]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key as string} className="text-slate-300">
                        {label}
                      </Label>
                      <Input
                        id={key as string}
                        className={field}
                        value={(formData as any)[key as string]}
                        onChange={(e) =>
                          handleChange(key as string, e.target.value)
                        }
                        placeholder={ph as string}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Property Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Property Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["price", "Price", "500000", "text"],
                    ["bedrooms", "Bedrooms", "3", "number"],
                    ["bathrooms", "Bathrooms", "2", "number"],
                    ["squareFeet", "Square Feet", "1500", "number"],
                  ].map(([key, label, ph, type]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key as string} className="text-slate-300">
                        {label}
                      </Label>
                      <Input
                        id={key as string}
                        type={type as string}
                        className={field}
                        value={(formData as any)[key as string]}
                        onChange={(e) =>
                          handleChange(key as string, e.target.value)
                        }
                        placeholder={ph as string}
                      />
                    </div>
                  ))}
                </div>
              </section>

              {/* Status & Availability */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Status & Availability
                </h3>
                <div className="flex flex-wrap gap-6">
                  {[
                    ["isForSale", "For Sale"],
                    ["isForRent", "For Rent"],
                    ["isAvailable", "Available"],
                    ["hasOwnershipDocument", "Has Ownership Document"],
                  ].map(([key, label]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={(formData as any)[key]}
                        onCheckedChange={(checked) =>
                          handleChange(key, checked)
                        }
                      />
                      <Label htmlFor={key} className="text-slate-300">
                        {label}
                      </Label>
                    </div>
                  ))}
                </div>
              </section>

              {/* Additional Details */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Additional Details
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    ["orientation", "Orientation", "North-facing"],
                    ["furniture", "Furniture", "Fully furnished"],
                    ["heatingSystem", "Heating System", "Central heating"],
                    ["floorLevel", "Floor Level", "Ground floor"],
                    ["spaces", "Parking Spaces", "2", "number"],
                    ["builder", "Builder", "ABC Construction"],
                  ].map(([key, label, ph, type]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key as string} className="text-slate-300">
                        {label}
                      </Label>
                      <Input
                        id={key as string}
                        type={(type as string) || "text"}
                        className={field}
                        value={(formData as any)[key as string]}
                        onChange={(e) =>
                          handleChange(key as string, e.target.value)
                        }
                        placeholder={ph as string}
                      />
                    </div>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="additionalFeatures"
                    className="text-slate-300"
                  >
                    Additional Features
                  </Label>
                  <Textarea
                    id="additionalFeatures"
                    className={`${field} min-h-[90px]`}
                    value={formData.additionalFeatures}
                    onChange={(e) =>
                      handleChange("additionalFeatures", e.target.value)
                    }
                    placeholder="Pool, garden, garage..."
                    rows={2}
                  />
                </div>
              </section>

              {/* Coordinates & Media */}
              <section className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-100">
                  Coordinates & Media
                </h3>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["latitude", "Latitude", "40.7128", "number"],
                    ["longitude", "Longitude", "-74.0060", "number"],
                    ["exteriorVideo", "Exterior Video URL", "https://..."],
                    ["interiorVideo", "Interior Video URL", "https://..."],
                  ].map(([key, label, ph, type]) => (
                    <div key={key} className="space-y-2">
                      <Label htmlFor={key as string} className="text-slate-300">
                        {label}
                      </Label>
                      <Input
                        id={key as string}
                        type={(type as string) || "text"}
                        step={type === "number" ? "any" : undefined}
                        className={field}
                        value={(formData as any)[key as string]}
                        onChange={(e) =>
                          handleChange(key as string, e.target.value)
                        }
                        placeholder={ph as string}
                      />
                    </div>
                  ))}
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
