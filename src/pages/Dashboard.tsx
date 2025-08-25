import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Plus,
  Edit,
  Trash2,
  Images,
  LogOut,
  Home,
  DollarSign,
  BedDouble,
  Bath,
  Square,
  MapPin,
} from "lucide-react";

interface Property {
  propertyId: number;
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  isForSale: boolean;
  isForRent: boolean;
  price: number | string; // tolerate string to avoid NaN
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  isAvailable: boolean;
  orientation: string;
  furniture: string;
  heatingSystem: string;
  additionalFeatures: string;
  hasOwnershipDocument: boolean;
  spaces: number;
  floorLevel: string;
  country: string;
  neighborhood: string;
  builder: string;
  complex: string;
  latitude: number;
  longitude: number;
  exteriorVideo: string;
  interiorVideo: string;
}

const Dashboard = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (sessionStorage.getItem("isAuthenticated") !== "true") {
      navigate("/login");
    } else {
      fetchProperties();
    }
  }, [navigate]);

  // Use Vite proxy in dev (empty base), real domain in prod
  const base = import.meta.env.PROD ? "https://api.realo-realestate.com" : "";

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${base}/api/Property/GetProperties`);
      // axios already gives parsed data
      setProperties(res.data?.$values || res.data || []);
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to fetch properties. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = (id: number) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      await axios.delete(
        `${base}/api/Property/DeleteProperty/${propertyToDelete}`
      );
      setProperties((prev) =>
        prev.filter((p) => p.propertyId !== propertyToDelete)
      );
      toast({
        title: "Success",
        description: "Property deleted successfully.",
      });
    } catch (e) {
      console.error(e);
      toast({
        title: "Error",
        description: "Failed to delete property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setPropertyToDelete(null);
    }
  };

  const handleEditProperty = (id: number) => navigate(`/edit-property/${id}`);
  const handleManageImages = (id: number) => navigate(`/manage-images/${id}`);
  const handleLogout = () => {
    sessionStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const formatPrice = (price: number | string) => {
    const n = typeof price === "string" ? Number(price) : price;
    if (Number.isNaN(n)) return "—";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(n);
  };

  return (
    <div className="min-h-screen bg-[#0b1220] text-slate-200 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <Card className="border border-slate-800 bg-[#0f172a]/70 backdrop-blur-sm shadow-[0_10px_30px_-10px_rgba(99,102,241,0.25)]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/15 p-2">
                  <Building2 className="h-8 w-8 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-slate-100">
                    Property Management Dashboard
                  </CardTitle>
                  <p className="text-sm text-slate-400">
                    Manage your real estate portfolio
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => navigate("/add-property")}
                  className="bg-blue-500 hover:bg-blue-500/90 text-white shadow-md"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Property
                </Button>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          {[
            {
              icon: <Home className="h-5 w-5 text-blue-400" />,
              bg: "bg-blue-500/10",
              label: "Total Properties",
              value: properties.length,
            },
            {
              icon: <DollarSign className="h-5 w-5 text-emerald-400" />,
              bg: "bg-emerald-500/10",
              label: "For Sale",
              value: properties.filter((p) => p.isForSale).length,
            },
            {
              icon: <Building2 className="h-5 w-5 text-amber-400" />,
              bg: "bg-amber-500/10",
              label: "For Rent",
              value: properties.filter((p) => p.isForRent).length,
            },
            {
              icon: <Square className="h-5 w-5 text-indigo-300" />,
              bg: "bg-indigo-500/10",
              label: "Available",
              value: properties.filter((p) => p.isAvailable).length,
            },
          ].map((s, i) => (
            <Card
              key={i}
              className="border border-slate-800 bg-[#0f172a] shadow-[0_4px_20px_rgba(2,6,23,0.5)]"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg p-2 ${s.bg}`}>{s.icon}</div>
                  <div>
                    <p className="text-sm text-slate-400">{s.label}</p>
                    <p className="text-2xl font-bold text-slate-100">
                      {s.value}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Properties */}
        <Card className="border border-slate-800 bg-[#0f172a]">
          <CardHeader>
            <CardTitle className="text-slate-100">Properties</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-400" />
              </div>
            ) : properties.length === 0 ? (
              <div className="py-12 text-center">
                <Building2 className="mx-auto mb-4 h-12 w-12 text-slate-500" />
                <p className="text-slate-400">No properties found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {properties.map((p) => (
                  <Card
                    key={p.propertyId}
                    className="border border-slate-800 bg-[#0b1323] hover:ring-1 hover:ring-blue-500/30"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        {/* title & badges */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="truncate font-semibold text-slate-100 text-wrap">
                              {p.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {p.city}, {p.state}
                              </span>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            {p.isForSale && (
                              <span className="rounded-full bg-emerald-600/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                Sale
                              </span>
                            )}
                            {p.isForRent && (
                              <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
                                Rent
                              </span>
                            )}
                          </div>
                        </div>

                        {/* price */}
                        <div className="text-2xl font-bold text-blue-400">
                          {formatPrice(p.price)}
                        </div>

                        {/* facts */}
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <div className="flex items-center gap-1">
                            <BedDouble className="h-4 w-4" />
                            <span>{p.bedrooms} bed</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Bath className="h-4 w-4" />
                            <span>{p.bathrooms} bath</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Square className="h-4 w-4" />
                            <span>{p.squareFeet} sqft</span>
                          </div>
                        </div>

                        {/* desc */}
                        <p className="line-clamp-2 text-sm text-slate-400">
                          {p.description}
                        </p>

                        {/* actions */}
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditProperty(p.propertyId)}
                            className="flex-1 border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800"
                          >
                            <Edit className="mr-2 h-3 w-3" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleManageImages(p.propertyId)}
                            className="border-slate-700 bg-[#0b1220] text-slate-200 hover:bg-slate-800"
                          >
                            <Images className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProperty(p.propertyId)}
                            className="bg-rose-600 hover:bg-rose-600/90"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="bg-[#0f172a] text-slate-200 border border-slate-800">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-slate-400">
                This action cannot be undone. This will permanently delete the
                property and all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="bg-slate-800 text-slate-200 hover:bg-slate-700">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction className="bg-rose-600 text-white hover:bg-rose-600/90">
                <span onClick={confirmDelete}>Delete Property</span>
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
};

export default Dashboard;
