"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/shared/PageHeader";
import { BikeCard } from "@/components/shared/BikeCard";
import { Search, Filter, Bike as BikeIcon, ChevronLeft, ChevronRight, X } from "lucide-react";

interface BikeImage {
  url: string;
  isPrimary: boolean;
}

interface Bike {
  id: string;
  name: string;
  brand: string;
  model: string;
  price: string;
  range: string;
  topSpeed: string;
  batteryCapacity: string;
  isAvailable: boolean;
  images: BikeImage[];
}

interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function DealerBikesClient() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, limit: 12, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [availabilityFilter, setAvailabilityFilter] = useState("true");
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const fetchBikes = useCallback(async (page = 1) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "12",
        ...(search && { search }),
        ...(brandFilter && { brand: brandFilter }),
        ...(availabilityFilter !== "all" && { isAvailable: availabilityFilter }),
      });
      const res = await fetch(`/api/bikes?${params}`);
      const data = await res.json();
      setBikes(data.bikes);
      setBrands(data.brands || []);
      setPagination(data.pagination);
    } finally {
      setIsLoading(false);
    }
  }, [search, brandFilter, availabilityFilter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchBikes(1), 300);
    return () => clearTimeout(timer);
  }, [fetchBikes]);

  const clearFilters = () => {
    setSearch("");
    setBrandFilter("");
    setAvailabilityFilter("true");
  };

  const hasFilters = search || brandFilter || availabilityFilter !== "true";

  return (
    <div className="space-y-5 animate-fade-in">
      <PageHeader
        title="Browse EV Bikes"
        description="Explore our latest electric vehicle inventory"
        breadcrumb={[{ label: "Dealer" }, { label: "Bikes" }]}
      />

      {/* Search + Filter Bar */}
      <div className="card-premium p-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="dealer-bike-search"
              type="text"
              placeholder="Search bikes by name, brand, model..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="form-input pl-9"
            />
          </div>
          <button
            id="dealer-bike-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-colors ${showFilters ? "border-blue-600 bg-blue-50 text-blue-600" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasFilters && <span className="w-2 h-2 rounded-full bg-blue-600" />}
          </button>
        </div>

        {/* Expanded filters */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap gap-3 items-center">
            <select
              id="dealer-brand-filter"
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              className="form-input w-auto min-w-36"
            >
              <option value="">All Brands</option>
              {brands.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>

            <select
              id="dealer-availability-filter"
              value={availabilityFilter}
              onChange={(e) => setAvailabilityFilter(e.target.value)}
              className="form-input w-auto min-w-36"
            >
              <option value="all">All Availability</option>
              <option value="true">Available Only</option>
              <option value="false">Unavailable</option>
            </select>

            {hasFilters && (
              <button
                id="dealer-clear-filters"
                onClick={clearFilters}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-red-500 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Clear Filters
              </button>
            )}
          </div>
        )}
      </div>

      {/* Results count */}
      {!isLoading && (
        <p className="text-sm text-slate-500">
          {pagination.total} bike{pagination.total !== 1 ? "s" : ""} found
          {search && <span> for "<strong>{search}</strong>"</span>}
        </p>
      )}

      {/* Bikes Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card-premium h-72 animate-pulse">
              <div className="h-48 bg-slate-100 rounded-t-2xl" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-slate-100 rounded w-3/4" />
                <div className="h-3 bg-slate-100 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : bikes.length === 0 ? (
        <div className="card-premium p-16 text-center">
          <BikeIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
          <p className="text-slate-500 font-medium">No bikes found</p>
          <p className="text-sm text-slate-400 mt-1">
            {search ? "Try a different search term" : "No bikes are currently available"}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="mt-4 text-sm text-blue-600 hover:underline">
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {bikes.map((bike) => (
            <BikeCard
              key={bike.id}
              id={bike.id}
              name={bike.name}
              brand={bike.brand}
              model={bike.model}
              price={Number(bike.price)}
              range={bike.range}
              topSpeed={bike.topSpeed}
              batteryCapacity={bike.batteryCapacity}
              isAvailable={bike.isAvailable}
              primaryImage={bike.images.find((img) => img.isPrimary)?.url || bike.images[0]?.url}
              viewPrefix="/dealer/bikes"
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            id="dealer-bikes-prev"
            onClick={() => fetchBikes(pagination.page - 1)}
            disabled={pagination.page === 1}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-sm text-slate-500">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <button
            id="dealer-bikes-next"
            onClick={() => fetchBikes(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

