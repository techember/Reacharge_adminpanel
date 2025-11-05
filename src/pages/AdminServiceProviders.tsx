import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  Wrench, 
  Users, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2 
} from 'lucide-react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

// Types
interface ServiceProvider {
  id: string;
  name: string;
  serviceType: string;
  city: string;
  pincode: string;
  isActive: boolean;
  phoneNumber: string;
  email: string;
  rating: number;
  totalJobs: number;
}

// Mock data
const mockServiceProviders: ServiceProvider[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    serviceType: 'Electrician',
    city: 'Mumbai',
    pincode: '400001',
    isActive: true,
    phoneNumber: '+91 9876543210',
    email: 'rajesh.kumar@email.com',
    rating: 4.8,
    totalJobs: 127,
  },
  {
    id: '2',
    name: 'Sunil Barber Shop',
    serviceType: 'Barber',
    city: 'Delhi',
    pincode: '110001',
    isActive: true,
    phoneNumber: '+91 9876543211',
    email: 'sunil.barber@email.com',
    rating: 4.5,
    totalJobs: 89,
  },
  {
    id: '3',
    name: 'Cool Breeze AC Services',
    serviceType: 'AC Repair',
    city: 'Bangalore',
    pincode: '560001',
    isActive: false,
    phoneNumber: '+91 9876543212',
    email: 'coolbreeze@email.com',
    rating: 4.2,
    totalJobs: 156,
  },
];

export const AdminServiceProviders: React.FC = () => {
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [pincodeFilter, setPincodeFilter] = useState('');
  const [activeOnlyFilter, setActiveOnlyFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'serviceType' | ''>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Mock API call
  useEffect(() => {
    const fetchServiceProviders = async () => {
      setLoading(true);
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setServiceProviders(mockServiceProviders);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to fetch service providers',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchServiceProviders();
  }, []);

  // Filter + sort
  const filteredProviders = useMemo(() => {
    let filtered = serviceProviders.filter(provider => {
      const matchesSearch =
        provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        provider.serviceType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCity = !cityFilter || provider.city.toLowerCase().includes(cityFilter.toLowerCase());
      const matchesPincode = !pincodeFilter || provider.pincode.includes(pincodeFilter);
      const matchesActive = !activeOnlyFilter || provider.isActive;

      return matchesSearch && matchesCity && matchesPincode && matchesActive;
    });

    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[sortBy].toLowerCase();
        const bValue = b[sortBy].toLowerCase();
        const comparison = aValue.localeCompare(bValue);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    return filtered;
  }, [serviceProviders, searchQuery, cityFilter, pincodeFilter, activeOnlyFilter, sortBy, sortOrder]);

  const handleStatusToggle = async (providerId: string, newStatus: boolean) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      setServiceProviders(prev =>
        prev.map(provider =>
          provider.id === providerId ? { ...provider, isActive: newStatus } : provider
        )
      );
      toast({
        title: 'Status Updated',
        description: `Provider status has been ${newStatus ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update provider status',
        variant: 'destructive',
      });
    }
  };

  const handleSort = (column: 'name' | 'serviceType') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCityFilter('');
    setPincodeFilter('');
    setActiveOnlyFilter(false);
    setSortBy('');
  };

  return (
    <AdminLayout title="Service Providers"> 
      <div className="space-y-6">
        {/* Page Title */}
        {/* <div>
          <h2 className="text-2xl font-semibold text-foreground">Service Providers</h2>
          <p className="text-muted-foreground mt-1">
            Manage and monitor all registered service providers
          </p>
        </div> */}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Search by name or service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Input
                placeholder="Filter by city"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              />
              <Input
                placeholder="Filter by pincode"
                value={pincodeFilter}
                onChange={(e) => setPincodeFilter(e.target.value)}
              />
              <div className="flex items-center space-x-2">
                <Switch
                  id="active-only"
                  checked={activeOnlyFilter}
                  onCheckedChange={setActiveOnlyFilter}
                />
                <label htmlFor="active-only" className="text-sm">
                  Active Only
                </label>
              </div>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Service Providers List</CardTitle>
          </CardHeader>
          <CardContent className="overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('name')} className="cursor-pointer">
                    Name {sortBy === 'name' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead onClick={() => handleSort('serviceType')} className="cursor-pointer">
                    Service Type {sortBy === 'serviceType' ? (sortOrder === 'asc' ? '↑' : '↓') : ''}
                  </TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Pincode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Total Jobs</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredProviders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center">
                      No service providers found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProviders.map(provider => (
                    <TableRow key={provider.id}>
                      <TableCell>{provider.name}</TableCell>
                      <TableCell>{provider.serviceType}</TableCell>
                      <TableCell>{provider.city}</TableCell>
                      <TableCell>{provider.pincode}</TableCell>
                      <TableCell>
                        <Switch
                          checked={provider.isActive}
                          onCheckedChange={(status) => handleStatusToggle(provider.id, status)}
                        />
                      </TableCell>
                      <TableCell>{provider.phoneNumber}</TableCell>
                      <TableCell>{provider.email}</TableCell>
                      <TableCell>{provider.rating}</TableCell>
                      <TableCell>{provider.totalJobs}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="w-8 h-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" /> View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};


// export default AdminServiceProviders;
