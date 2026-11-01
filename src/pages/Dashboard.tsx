import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  Bath,
  BedDouble,
  Building2,
  Edit,
  Eye,
  Images,
  LogOut,
  MapPin,
  Plus,
  Square,
  Trash2,
  Video,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiUrl, normalizeMediaUrl } from "@/lib/api";
import { formatPublicPrice } from "@/lib/price";
import { isLoggedIn, logout } from "@/lib/auth";
import logoImage from "../assets/LogoMainSection.png";

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
  price: string;
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
  floorPlanUrl?: string;
  virtualTourUrl?: string;
  virtualTourId?: number | null;
  virtualTourRoomCount?: number;
  hasInternalVirtualTour?: boolean;
  hasPublishedVirtualTour?: boolean;
  images?: Array<{ imageUrl: string }>;
}

function toArray<T = unknown>(v: any, label?: string): T[] {
  if (Array.isArray(v)) return v as T[];
  if (v && typeof v === "object") {
    if (Array.isArray(v.$values)) return v.$values as T[];
    if (Array.isArray(v.data)) return v.data as T[];
  }
  if (label) console.warn(`Expected array at ${label}, got:`, v);
  return [];
}

// Same formatter as the public site, so "1.300/m2" shows as €1,300/m² rather than €13,002.
const formatPrice = (price: number | string) => formatPublicPrice(price);

const hasAnyTour = (property: Pick<Property, "virtualTourUrl" | "hasInternalVirtualTour" | "hasPublishedVirtualTour">) =>
  Boolean(property.hasInternalVirtualTour || property.hasPublishedVirtualTour || property.virtualTourUrl);

const chartColors = ["#c9ab03", "#f1d676", "#0a4834", "#ebe1cf", "#8f7a30"];

const Dashboard: React.FC = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isLoggedIn()) {
      navigate("/login");
      return;
    }

    // Confirm the session with the API; a 401 (expired, or password changed) sends the
    // admin back to the login page via the axios interceptor.
    axios.get(apiUrl("api/Auth/Me")).catch(() => undefined);

    const ac = new AbortController();

    async function fetchProperties() {
      try {
        setLoading(true);
        const res = await axios.get(apiUrl("api/Property/GetProperties"), {
          headers: { Accept: "application/json" },
          signal: ac.signal,
        });
        const ct = String(res.headers?.["content-type"] || "");
        if (!ct.includes("application/json")) {
          throw new Error(`Unexpected content-type: ${ct}`);
        }
        setProperties(toArray<Property>(res.data));
      } catch (e: any) {
        if (e?.name === "CanceledError" || e?.code === "ERR_CANCELED") return;
        console.error("GetProperties failed:", e);
        toast({
          title: "Error",
          description: e?.response?.status
            ? `Failed to fetch properties (HTTP ${e.response.status}).`
            : "Failed to fetch properties. Please try again.",
          variant: "destructive",
        });
        setProperties([]);
      } finally {
        setLoading(false);
      }
    }

    fetchProperties();
    return () => ac.abort();
  }, [navigate, toast]);

  const list = toArray<Property>(properties);

  // Table tools: 300+ rows need search, quick filters and paging to stay usable.
  const PAGE_SIZE = 20;
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [mediaFilter, setMediaFilter] = useState("");
  const [page, setPage] = useState(1);

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    return list
      .filter(
        (p) =>
          !q ||
          String(p.propertyId).includes(q) ||
          (p.title ?? "").toLowerCase().includes(q) ||
          (p.city ?? "").toLowerCase().includes(q) ||
          (p.address ?? "").toLowerCase().includes(q)
      )
      .filter((p) => !typeFilter || (p.propertyType ?? "").toLowerCase() === typeFilter)
      .filter((p) => !statusFilter || (statusFilter === "sale" ? p.isForSale : !p.isForSale))
      .filter((p) => {
        if (mediaFilter === "no-photos") return !p.images?.length;
        if (mediaFilter === "no-tour") return !hasAnyTour(p);
        if (mediaFilter === "no-plan") return !p.floorPlanUrl;
        return true;
      })
      .sort((a, b) => Number(b.propertyId) - Number(a.propertyId));
  }, [list, query, typeFilter, statusFilter, mediaFilter]);

  useEffect(() => setPage(1), [query, typeFilter, statusFilter, mediaFilter]);
  const pageCount = Math.max(1, Math.ceil(filteredList.length / PAGE_SIZE));
  const pageRows = filteredList.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const typeOptions = useMemo(
    () => Array.from(new Set(list.map((p) => (p.propertyType ?? "").toLowerCase()).filter(Boolean))).sort(),
    [list]
  );
  const toolbarField =
    "h-11 rounded-none border border-real-estate-secondary/20 bg-[#050705] px-3 text-sm text-[#f5f0e8] outline-none focus:border-real-estate-secondary";

  const analytics = useMemo(() => {
    const typeCounts = list.reduce<Record<string, number>>((acc, property) => {
      const type = property.propertyType || "Property";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    const cityCounts = list.reduce<Record<string, number>>((acc, property) => {
      const city = property.city || "Unlisted";
      acc[city] = (acc[city] || 0) + 1;
      return acc;
    }, {});

    return {
      typeData: Object.entries(typeCounts).map(([name, value]) => ({
        name,
        value,
      })),
      cityData: Object.entries(cityCounts)
        .map(([name, value]) => ({ name, listings: value }))
        .sort((a, b) => b.listings - a.listings)
        .slice(0, 6),
    };
  }, [list]);

  const stats = [
    {
      label: "Total Properties",
      value: list.length,
      detail: "active portfolio",
    },
    {
      label: "For Sale",
      value: list.filter((p) => p.isForSale).length,
      detail: "sale listings",
    },
    {
      label: "For Rent",
      value: list.filter((p) => p.isForRent || !p.isForSale).length,
      detail: "rental listings",
    },
    {
      label: "360 Tours",
      value: list.filter(hasAnyTour).length,
      detail: "internal and external tours",
    },
  ];

  const handleDeleteProperty = (id: number) => {
    setPropertyToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!propertyToDelete) return;
    try {
      await axios.delete(apiUrl(`api/Property/DeleteProperty/${propertyToDelete}`));
      setProperties((prev) =>
        prev.filter((p) => p.propertyId !== propertyToDelete)
      );
      toast({
        title: "Success",
        description: "Property deleted successfully.",
      });
    } catch (e) {
      console.error("DeleteProperty failed:", e);
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
  const handleManageTour = (id: number) => navigate(`/manage-tour/${id}`);
  const handlePreviewProperty = (p: Property) =>
    navigate(`/properties/${encodeURIComponent(p.title)}/${p.propertyId}`);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#050705] text-[#f5f0e8]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,171,3,0.12),transparent_34%),linear-gradient(120deg,rgba(10,72,52,0.35),transparent_42%)]" />

      <main className="relative mx-auto max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
        <header className="border border-real-estate-secondary/20 bg-[#08150f]/85 p-5 shadow-2xl shadow-black/40 backdrop-blur md:p-6">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex w-fit items-center gap-3"
                aria-label="Go to home page"
              >
                <img src={logoImage} alt="Realo Real Estate" className="h-14 w-auto" />
                <span className="hidden font-title text-sm uppercase tracking-[0.35em] text-real-estate-secondary sm:inline">
                  Real Estate
                </span>
              </button>
              <div className="h-px w-full bg-real-estate-secondary/20 sm:h-14 sm:w-px" />
              <div>
                <p className="font-text text-xs uppercase tracking-[0.32em] text-real-estate-secondary">
                  Admin Control Room
                </p>
                <h1 className="mt-2 font-title text-5xl leading-none text-[#f5f0e8] md:text-7xl">
                  Dashboard
                </h1>
                <p className="mt-2 max-w-xl text-sm text-[#f5f0e8]/65">
                  Manage listings, media, virtual tours, and live property actions from one editorial workspace.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => navigate("/add-property")}
                className="border border-real-estate-secondary bg-real-estate-secondary px-5 py-5 font-text text-xs font-bold uppercase tracking-[0.22em] text-real-estate-primary hover:bg-[#f1d676]"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Property
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="border-real-estate-secondary/40 bg-transparent px-5 py-5 font-text text-xs font-bold uppercase tracking-[0.22em] text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <article
              key={stat.label}
              className="border border-real-estate-secondary/15 bg-[#0d1510] p-6 shadow-xl shadow-black/20"
            >
              <p className="font-text text-xs uppercase tracking-[0.28em] text-[#f5f0e8]/45">
                {stat.label}
              </p>
              <strong className="mt-4 block font-title text-5xl font-normal text-real-estate-secondary">
                {stat.value}
              </strong>
              <span className="mt-2 block text-sm text-[#f5f0e8]/55">
                {stat.detail}
              </span>
            </article>
          ))}
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="border border-real-estate-secondary/15 bg-[#0d1510] p-5">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-text text-xs uppercase tracking-[0.28em] text-real-estate-secondary">
                  Market View
                </p>
                <h2 className="mt-2 font-title text-3xl text-[#f5f0e8]">
                  Listings by City
                </h2>
              </div>
              <Building2 className="h-6 w-6 text-real-estate-secondary/70" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.cityData}>
                  <XAxis
                    dataKey="name"
                    stroke="#8f8a7f"
                    tickLine={false}
                    axisLine={{ stroke: "rgba(201,171,3,0.18)" }}
                  />
                  <YAxis
                    allowDecimals={false}
                    stroke="#8f8a7f"
                    tickLine={false}
                    axisLine={{ stroke: "rgba(201,171,3,0.18)" }}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(201,171,3,0.08)" }}
                    contentStyle={{
                      background: "#050705",
                      border: "1px solid rgba(201,171,3,0.35)",
                      color: "#f5f0e8",
                    }}
                  />
                  <Bar dataKey="listings" fill="#c9ab03" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </article>

          <article className="border border-real-estate-secondary/15 bg-[#0d1510] p-5">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="font-text text-xs uppercase tracking-[0.28em] text-real-estate-secondary">
                  Portfolio Mix
                </p>
                <h2 className="mt-2 font-title text-3xl text-[#f5f0e8]">
                  Property Type Distribution
                </h2>
              </div>
              <Square className="h-6 w-6 text-real-estate-secondary/70" />
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.typeData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={60}
                    outerRadius={105}
                    paddingAngle={3}
                  >
                    {analytics.typeData.map((entry, index) => (
                      <Cell
                        key={entry.name}
                        fill={chartColors[index % chartColors.length]}
                        stroke="#050705"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "#050705",
                      border: "1px solid rgba(201,171,3,0.35)",
                      color: "#f5f0e8",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </article>
        </section>

        <section className="mt-12">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-text text-xs uppercase tracking-[0.3em] text-real-estate-secondary">
                Listings
              </p>
              <h2 className="mt-2 font-title text-4xl text-[#f5f0e8] md:text-5xl">
                Property Management
              </h2>
            </div>
            <p className="text-sm text-[#f5f0e8]/55">
              {filteredList.length === list.length
                ? `${list.length} properties`
                : `${filteredList.length} of ${list.length} properties`}
            </p>
          </div>

          <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr]">
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search title, city, address or ID"
              aria-label="Search properties"
              className={`${toolbarField} sm:col-span-2 lg:col-span-1`}
            />
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} aria-label="Type" className={toolbarField}>
              <option value="">All types</option>
              {typeOptions.map((t) => (
                <option key={t} value={t}>
                  {t[0].toUpperCase() + t.slice(1)}
                </option>
              ))}
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} aria-label="Status" className={toolbarField}>
              <option value="">Sale and rent</option>
              <option value="sale">For sale</option>
              <option value="rent">For rent</option>
            </select>
            <select value={mediaFilter} onChange={(e) => setMediaFilter(e.target.value)} aria-label="Media" className={toolbarField}>
              <option value="">All media</option>
              <option value="no-photos">Missing photos</option>
              <option value="no-tour">Missing 360 tour</option>
              <option value="no-plan">Missing floor plan</option>
            </select>
          </div>

          <div className="border border-real-estate-secondary/15 bg-[#0d1510]">
            {loading ? (
              <div className="flex min-h-72 items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-real-estate-secondary border-t-transparent" />
              </div>
            ) : filteredList.length === 0 ? (
              <div className="flex min-h-72 flex-col items-center justify-center text-center">
                <Building2 className="mb-4 h-12 w-12 text-real-estate-secondary/60" />
                <p className="font-title text-3xl text-[#f5f0e8]">
                  No properties found
                </p>
                <p className="mt-2 text-sm text-[#f5f0e8]/55">
                  {list.length ? "Try a different search or filter." : "Add a property to start building the Realo portfolio."}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left lg:min-w-[1080px]">
                  <thead className="bg-[#050705] font-text text-xs uppercase tracking-[0.22em] text-real-estate-secondary">
                    <tr>
                      <th className="p-4 font-normal">Property</th>
                      <th className="hidden p-4 font-normal lg:table-cell">Type</th>
                      <th className="hidden p-4 font-normal sm:table-cell">Price</th>
                      <th className="hidden p-4 font-normal md:table-cell">Status</th>
                      <th className="hidden p-4 font-normal xl:table-cell">Media</th>
                      <th className="p-4 text-right font-normal">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((property) => (
                      <tr
                        key={property.propertyId}
                        className="border-t border-real-estate-secondary/10 text-[#f5f0e8]/80 transition hover:bg-real-estate-primary/20"
                      >
                        <td className="p-4">
                          <div className="flex min-w-0 items-center gap-4">
                            <div className="flex h-16 w-20 shrink-0 items-center justify-center overflow-hidden border border-real-estate-secondary/20 bg-[#050705]">
                              {property.images?.[0]?.imageUrl ? (
                                <img
                                  src={normalizeMediaUrl(property.images[0].imageUrl)}
                                  alt=""
                                  loading="lazy"
                                  decoding="async"
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <Building2 className="h-6 w-6 text-real-estate-secondary/60" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="line-clamp-2 font-title text-lg text-[#f5f0e8] sm:line-clamp-1 sm:text-xl">
                                {property.title || "Untitled property"}
                              </h3>
                              <p className="mt-1 text-xs text-[#f5f0e8]/40">
                                #{property.propertyId}
                                <span className="ml-2 font-title text-base text-real-estate-secondary sm:hidden">
                                  {formatPrice(property.price)}
                                </span>
                              </p>
                              <p className="mt-1 flex items-center gap-1 text-sm text-[#f5f0e8]/50">
                                <MapPin className="h-3.5 w-3.5 text-real-estate-secondary" />
                                {property.city || property.address || "No location"}
                              </p>
                              <p className="mt-2 flex flex-wrap gap-3 text-xs text-[#f5f0e8]/55">
                                {property.bedrooms ? (
                                  <span className="inline-flex items-center gap-1">
                                    <BedDouble className="h-3.5 w-3.5 text-real-estate-secondary" />
                                    {property.bedrooms} Beds
                                  </span>
                                ) : null}
                                {property.bathrooms ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Bath className="h-3.5 w-3.5 text-real-estate-secondary" />
                                    {property.bathrooms} Baths
                                  </span>
                                ) : null}
                                {property.squareFeet ? (
                                  <span className="inline-flex items-center gap-1">
                                    <Square className="h-3.5 w-3.5 text-real-estate-secondary" />
                                    {property.squareFeet} sq m
                                  </span>
                                ) : null}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="hidden p-4 text-sm lg:table-cell">{property.propertyType || "Property"}</td>
                        <td className="hidden whitespace-nowrap p-4 font-title text-2xl text-real-estate-secondary sm:table-cell">
                          {formatPrice(property.price)}
                        </td>
                        <td className="hidden p-4 md:table-cell">
                          <div className="flex flex-wrap gap-2">
                            {property.isForSale ? (
                              <span className="border border-real-estate-secondary/35 bg-real-estate-secondary px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-real-estate-primary">
                                For Sale
                              </span>
                            ) : null}
                            {property.isForRent || !property.isForSale ? (
                              <span className="border border-real-estate-secondary/35 bg-real-estate-primary px-2.5 py-1 text-xs font-bold uppercase tracking-[0.14em] text-real-estate-secondary">
                                For Rent
                              </span>
                            ) : null}
                            {property.isAvailable ? (
                              <span className="border border-[#f5f0e8]/20 px-2.5 py-1 text-xs uppercase tracking-[0.14em] text-[#f5f0e8]/70">
                                Available
                              </span>
                            ) : null}
                          </div>
                        </td>
                        <td className="hidden p-4 xl:table-cell">
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="border border-real-estate-secondary/20 px-2.5 py-1 text-[#f5f0e8]/65">
                              Photos {property.images?.length ?? 0}
                            </span>
                            <span
                              className={`border px-2.5 py-1 ${
                                hasAnyTour(property)
                                  ? "border-real-estate-secondary/45 text-real-estate-secondary"
                                  : "border-[#f5f0e8]/10 text-[#f5f0e8]/35"
                              }`}
                            >
                              {property.hasInternalVirtualTour
                                ? `360 tour${property.virtualTourRoomCount ? ` (${property.virtualTourRoomCount})` : ""}`
                                : property.virtualTourUrl
                                ? "External tour"
                                : "No tour"}
                            </span>
                            <span
                              className={`border px-2.5 py-1 ${
                                property.floorPlanUrl
                                  ? "border-real-estate-secondary/45 text-real-estate-secondary"
                                  : "border-[#f5f0e8]/10 text-[#f5f0e8]/35"
                              }`}
                            >
                              {property.floorPlanUrl ? "Has floor plan" : "No floor plan"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-wrap justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditProperty(property.propertyId)}
                              className="border-real-estate-secondary/35 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"
                            >
                              <Edit className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="sr-only sm:not-sr-only">Edit</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManageImages(property.propertyId)}
                              className="border-real-estate-secondary/35 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"
                            >
                              <Images className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="sr-only sm:not-sr-only">Media</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleManageTour(property.propertyId)}
                              className="border-real-estate-secondary/35 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"
                            >
                              <Video className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="sr-only sm:not-sr-only">Tour</span>
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handlePreviewProperty(property)}
                              className="border-real-estate-secondary/35 bg-transparent text-real-estate-secondary hover:bg-real-estate-secondary hover:text-real-estate-primary"
                            >
                              <Eye className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="sr-only sm:not-sr-only">Preview</span>
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleDeleteProperty(property.propertyId)}
                              className="border border-red-500/50 bg-red-950/40 text-red-200 hover:bg-red-700 hover:text-white"
                            >
                              <Trash2 className="h-3.5 w-3.5 sm:mr-2" />
                              <span className="sr-only sm:not-sr-only">Delete</span>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {pageCount > 1 && (
                  <div className="flex items-center justify-between gap-3 border-t border-real-estate-secondary/10 p-4 text-sm text-[#f5f0e8]/60">
                    <span>
                      Page {page} of {pageCount}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" disabled={page === 1} onClick={() => setPage((p) => p - 1)} className="border-real-estate-secondary/35 bg-transparent text-real-estate-secondary">
                        Previous
                      </Button>
                      <Button size="sm" variant="outline" disabled={page === pageCount} onClick={() => setPage((p) => p + 1)} className="border-real-estate-secondary/35 bg-transparent text-real-estate-secondary">
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="border border-real-estate-secondary/30 bg-[#050705] text-[#f5f0e8]">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-title text-3xl font-normal text-[#f5f0e8]">
              Delete this property?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[#f5f0e8]/55">
              This action cannot be undone. This will permanently delete the
              property and all associated data from the Realo dashboard.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-real-estate-secondary/25 bg-transparent text-[#f5f0e8] hover:bg-real-estate-primary hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-700 text-white hover:bg-red-600"
              onClick={confirmDelete}
            >
              Delete Property
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Dashboard;
