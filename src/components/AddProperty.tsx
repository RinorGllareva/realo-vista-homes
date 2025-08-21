import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { ArrowLeft, Plus } from "lucide-react";

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

const AddProperty = () => {
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
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (name: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await fetch(
        "https://realo-realestate.com/api/api/Property/PostProperty",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...formData,
            price: formData.price, // keep string, backend expects string
            bedrooms: parseInt(formData.bedrooms) || 0,
            bathrooms: parseInt(formData.bathrooms) || 0,
            squareFeet: parseFloat(formData.squareFeet) || 0,
            spaces: parseInt(formData.spaces) || 0,
            latitude: parseFloat(formData.latitude) || 0,
            longitude: parseFloat(formData.longitude) || 0,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response from server:", errorData);
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({ title: "Success", description: "Property added successfully!" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting property:", error);
      toast({
        title: "Error",
        description: "Failed to add property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // shared field classes for dark theme
  const field =
    "bg-[#0b1220] text-slate-200 placeholder:text-slate-500 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20";

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200 p-6">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <Card className="border border-slate-800 bg-[#0f172a]/70 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  className="border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <CardTitle className="text-2xl text-slate-100">
                  Add New Property
                </CardTitle>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Form */}
        <Card className="border border-slate-800 bg-[#0f172a]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
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
                      <Label htmlFor={key} className="text-slate-300">
                        {label}
                      </Label>
                      <Input
                        id={key}
                        type={(type as string) || "text"}
                        className={field}
                        value={(formData as any)[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
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
                      <Label htmlFor={key} className="text-slate-300">
                        {label}
                      </Label>
                      <Input
                        id={key}
                        type={(type as string) || "text"}
                        step={type === "number" ? "any" : undefined}
                        className={field}
                        value={(formData as any)[key]}
                        onChange={(e) => handleChange(key, e.target.value)}
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
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Property
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

export default AddProperty;
